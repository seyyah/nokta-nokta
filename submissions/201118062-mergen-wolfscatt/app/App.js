import React, { useEffect, useMemo, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuditWidget } from "@xtatistix/mobile-audit";
import HomeScreen from "./screens/HomeScreen";
import QuestionsScreen from "./screens/QuestionsScreen";
import LoadingScreen from "./screens/LoadingScreen";
import ResultScreen from "./screens/ResultScreen";
import VoiceAvatarScreen from "./screens/VoiceAvatarScreen";
import BridgeScreen from "./screens/BridgeScreen";
import { FOLLOW_UP_QUESTIONS, INITIAL_ANSWERS } from "./data/questions";
import { generateSpec } from "./utils/enrichment";
import { createAuditDeps } from "./auditHost";

const AUDIT_SCREEN_NAMES = {
  home: "HomeScreen",
  questions: "QuestionsScreen",
  loading: "LoadingScreen",
  result: "ResultScreen"
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [idea, setIdea] = useState("");
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [spec, setSpec] = useState(null);
  const generationTimeoutRef = useRef(null);

  const questions = useMemo(() => FOLLOW_UP_QUESTIONS, []);
  const currentScreen = AUDIT_SCREEN_NAMES[screen] || screen;
  const auditDeps = useMemo(() => createAuditDeps(currentScreen), [currentScreen]);

  const clearGenerationTimeout = () => {
    if (generationTimeoutRef.current) {
      clearTimeout(generationTimeoutRef.current);
      generationTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearGenerationTimeout();
    };
  }, []);

  const handleStart = (rawIdea) => {
    clearGenerationTimeout();
    setIdea(rawIdea.trim());
    setAnswers(INITIAL_ANSWERS);
    setCurrentQuestionIndex(0);
    setSpec(null);
    setScreen("questions");
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleQuestionsBack = () => {
    if (currentQuestionIndex === 0) {
      setScreen("home");
      return;
    }

    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleQuestionsNext = () => {
    if (currentQuestionIndex === questions.length - 1) {
      clearGenerationTimeout();
      setScreen("loading");

      generationTimeoutRef.current = setTimeout(() => {
        setSpec(generateSpec(idea, answers));
        setScreen("result");
        generationTimeoutRef.current = null;
      }, 1200);

      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    clearGenerationTimeout();
    setIdea("");
    setAnswers(INITIAL_ANSWERS);
    setCurrentQuestionIndex(0);
    setSpec(null);
    setScreen("home");
  };

  const handleBackHome = () => {
    clearGenerationTimeout();
    setScreen("home");
  };

  const handleEditAnswers = () => {
    clearGenerationTimeout();
    setSpec(null);
    setScreen("questions");
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      {screen === "home" && (
        <HomeScreen
          initialIdea={idea}
          onStart={handleStart}
          onOpenVoiceAvatar={() => setScreen("voiceAvatar")}
          onOpenBridge={() => setScreen("bridge")}
        />
      )}

      {screen === "questions" && (
        <QuestionsScreen
          idea={idea}
          questions={questions}
          answers={answers}
          currentIndex={currentQuestionIndex}
          onAnswerChange={handleAnswerChange}
          onBack={handleQuestionsBack}
          onNext={handleQuestionsNext}
        />
      )}

      {screen === "loading" && <LoadingScreen idea={idea} />}

      {screen === "result" && (
        <ResultScreen spec={spec} onRestart={handleRestart} onBackToQuestions={handleEditAnswers} />
      )}

      {screen === "voiceAvatar" && <VoiceAvatarScreen onBack={handleBackHome} />}

      {screen === "bridge" && <BridgeScreen onBack={handleBackHome} />}

      <AuditWidget deps={auditDeps} appName="Nokta Capture" />
    </SafeAreaProvider>
  );
}

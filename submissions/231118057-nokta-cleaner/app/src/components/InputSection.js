import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';

export default function InputSection({ onSubmit, isLoading, theme }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim().length === 0) return;
    Keyboard.dismiss();
    onSubmit(text);
  };

  const isEmpty    = text.trim().length === 0;
  const isDisabled = isLoading || isEmpty;

  const btnBg   = isDisabled ? theme.btnDisabledBg   : theme.btnBg;
  const btnText = isDisabled ? theme.btnDisabledText : theme.btnText;

  return (
    <View style={{ width: '100%', gap: 16 }}>
      <TextInput
        style={{
          backgroundColor: theme.inputBg,
          borderWidth: 2,
          borderColor: theme.border,
          color: theme.text,
          padding: 20,
          minHeight: 160,
          maxHeight: 300,
          fontSize: 17,
          fontWeight: '500',
          width: '100%',
          borderRadius: 16,
          textAlignVertical: 'top',
        }}
        multiline
        placeholder="Paste your raw, messy notes..."
        placeholderTextColor={theme.placeholder}
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
        editable={!isLoading}
      />
      <TouchableOpacity
        style={{
          width: '100%',
          height: 64,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 16,
          backgroundColor: btnBg,
        }}
        onPress={handleSubmit}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        {isLoading && <ActivityIndicator color={btnText} style={{ marginRight: 10 }} />}
        <Text style={{ fontWeight: '900', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: btnText }}>
          {isLoading ? 'Processing' : 'Analyze Data'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

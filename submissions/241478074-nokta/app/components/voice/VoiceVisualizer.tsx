
import React, { memo } from 'react';
import { View } from 'react-native';

function VoiceVisualizer({ amplitude }: { amplitude:number }) {
  return (
    <View style={{
      height:120,
      flexDirection:'row',
      alignItems:'flex-end',
      justifyContent:'center',
      gap:4
    }}>
      {Array.from({length:18}).map((_,i)=>(
        <View
          key={i}
          style={{
            width:8,
            height:20 + amplitude * 100 * ((i % 5) + 1) / 5,
            backgroundColor:'#8B5CF6',
            borderRadius:999
          }}
        />
      ))}
    </View>
  )
}

export default memo(VoiceVisualizer)

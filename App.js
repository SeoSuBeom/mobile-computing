import * as React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Audio } from 'expo-av';

const LEVEL_UPDATE_INTERVAL = 200; // 0.2초 간격으로 측정
const LEVEL_RANGE = 100;

export default function App() {
  const [recording, setRecording] = React.useState(null);
  const [sound, setSound] = React.useState(null);
  const [recordedSound, setRecordedSound] = React.useState(null);
  const [currentLevel, setCurrentLevel] = React.useState(0);

  const measureSoundLevel = async () => {
    console.log('input level');
    //const { soundLevel } = await Audio.requestPermissionsAsync();
    const { sound } = true;
    console.log('middle level');
    //console.log(soundLevel);
    if (sound) {
      setInterval(async () => {
        const current = await Audio.getAverageLevelAsync();
        const level = Math.floor((current * LEVEL_RANGE) / 1.0);
        setCurrentLevel(level);
        console.log('output level');
        console.log(level); // 출력
      }, LEVEL_UPDATE_INTERVAL);
    }
    console.log('why');
  };

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      measureSoundLevel();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordedSound(uri);
    }
  }

  async function playRecording() {
    if (recordedSound && !sound) {
      const { sound } = await Audio.Sound.createAsync({ uri: recordedSound });
      setSound(sound);
      await sound.playAsync();
    }
  }

  async function stopPlayback() {
    if (sound) {
      await sound.stopAsync();
      setSound(null);
    }
  }

  React.useEffect(() => {
    return () => {
      stopPlayback(); // Stop playback when component unmounts
    };
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      {!recording && recordedSound && (
        <Button
          title="Play Recording"
          onPress={playRecording}
          disabled={sound !== null}
        />
      )}
      {sound && (
        <Button
          title="Stop Playback"
          onPress={stopPlayback}
        />
      )}
      <Text>음량을 조절하세요!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

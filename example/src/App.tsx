import {
  // CacheManager,
  CachedImage,
  CachedVideo,
  getProgressPercent,
} from 'expo-cached-media'
import type { DownloadProgressData } from 'expo-file-system'
import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native'

const Placeholder = ({
  totalBytesWritten,
  totalBytesExpectedToWrite,
  decimalPlace = 2,
}: DownloadProgressData & { decimalPlace: number }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {getProgressPercent(
          totalBytesWritten,
          totalBytesExpectedToWrite,
          decimalPlace,
        ) + '%'}
      </Text>
    </View>
  )
}

export default function App() {
  const video = React.useRef(null)
  return (
    <View style={styles.container}>
      <CachedVideo
        ref={video}
        source={{
          uri: 'https://sample-videos.com/video123/mp4/240/big_buck_bunny_240p_30mb.mp4',
          expiresIn: 1,
        }}
        placeholderContent={({
          totalBytesWritten,
          totalBytesExpectedToWrite,
        }) => (
          <Placeholder
            totalBytesWritten={totalBytesWritten}
            totalBytesExpectedToWrite={totalBytesExpectedToWrite}
            decimalPlace={1}
          />
        )}
        shouldPlay
        isLooping
        useNativeControls
        resizeMode="contain"
        style={styles.container}
      />
      <CachedImage
        source={{
          uri: 'https://sample-videos.com/img/Sample-jpg-image-500kb.jpg',
        }}
        placeholderContent={Placeholder}
        resizeMode="cover"
        style={styles.container}
      >
        <Text style={styles.text}>ImageBackground</Text>
      </CachedImage>
      {/*  */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    color: '#000',
  },
})

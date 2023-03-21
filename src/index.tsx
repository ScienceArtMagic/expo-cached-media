import { Video, VideoProps } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import React, {
  useEffect,
  useState,
  useRef,
  // Suspense,
  forwardRef,
  // lazy,
} from 'react'
import {
  Image,
  ImageBackground,
  ImageBackgroundComponent,
  ImageBackgroundProps,
  ImageComponent,
  ImageProps,
  StyleSheet,
  View,
} from 'react-native'

interface CachedMediaURISource {
  uri: string
  headers?: { [key: string]: string }
  expiresIn?: number
}

export interface CachedMediaProps {
  source: CachedMediaURISource
  cacheKey?: string
  placeholderContent?: ({
    totalBytesWritten,
    totalBytesExpectedToWrite,
  }: FileSystem.DownloadProgressData) => React.ReactElement
  children?: React.ReactNode
  rest?: { [key: string]: any }
}

type VideoComponent = typeof Video

export const MEDIA_CACHE_FOLDER = `${FileSystem?.cacheDirectory}`
// export const MEDIA_DOCUMENT_FOLDER = `${FileSystem.documentDirectory}media/`

// const Image = lazy(() => import('./suspense/Image'))
// const ImageBackground = lazy(() => import('./suspense/ImageBackground'))
// const Video = lazy(() => import('./suspense/Video'))

/** @returns Number between 0 and 100, optionally with decimal to the specified decimalPlace */
export const getProgressPercent = (
  totalBytesWritten: number,
  totalBytesExpectedToWrite: number,
  decimalPlace = 0, // output percentage without decimal by default
) => {
  const rawPercentage = (totalBytesWritten / totalBytesExpectedToWrite) * 100
  return Number(rawPercentage?.toFixed(decimalPlace))
}

/** @returns Number between 0 and 1, to the specified decimalPlace */
export const getProgress = (
  totalBytesWritten: number,
  totalBytesExpectedToWrite: number,
  decimalPlace = 3,
) => {
  const rawProgress = totalBytesWritten / totalBytesExpectedToWrite
  return Number(rawProgress?.toFixed(decimalPlace))
}

export const getFileNameFromUri = (uri: string) => {
  return uri
    .substring(uri.lastIndexOf('/') + 1)
    .split('?')[0]
    .split('#')[0]
}

const CacheManager = {
  addToCacheAsync: async ({
    file,
    key = getFileNameFromUri(file),
  }: {
    file: string
    key: string
  }) => {
    await FileSystem.copyAsync({
      from: file,
      to: `${MEDIA_CACHE_FOLDER}${key}`,
    })
    // const uri = await FileSystem.getContentUriAsync(`${MEDIA_DOCUMENT_FOLDER}${key}`)

    const uri = await CacheManager.getCachedUriAsync({ key })
    return uri
  },

  getCachedUriAsync: async ({ key }: { key: string }) => {
    const uri = await FileSystem.getContentUriAsync(
      `${MEDIA_CACHE_FOLDER}${key}`,
    )
    return uri
  },

  downloadAsync: async ({
    uri,
    key = getFileNameFromUri(uri),
    options,
  }: {
    uri: string
    key: string
    options: FileSystem.DownloadOptions
  }) => {
    return await FileSystem.downloadAsync(
      uri,
      `${MEDIA_CACHE_FOLDER}${key}`,
      options,
    )
  },
}

function createCachedMediaElement<T>(name: 'CachedImage' | 'CachedVideo') {
  const CachedMediaElement = forwardRef<
    T,
    CachedMediaProps & (ImageProps | ImageBackgroundProps | VideoProps)
  >((props, ref) => {
    const progress = useRef<FileSystem.DownloadProgressData>({
      totalBytesWritten: 0,
      totalBytesExpectedToWrite: 1000,
    })
    const [{ totalBytesWritten, totalBytesExpectedToWrite }, updateProgress] =
      useState<FileSystem.DownloadProgressData>(progress.current)

    const {
      source,
      cacheKey = getFileNameFromUri(source.uri),
      placeholderContent = () => <View style={styles.flexFill} />,
      children,
      rest,
    } = props
    const { uri, headers, expiresIn }: CachedMediaURISource = source
    const fileUri = `${MEDIA_CACHE_FOLDER}${cacheKey}`

    const _callback = (downloadProgress: FileSystem.DownloadProgressData) => {
      if (componentIsMounted.current === false) {
        downloadResumableRef.current.pauseAsync()
        FileSystem.deleteAsync(fileUri, { idempotent: true }) // delete file locally if it was not downloaded properly
      }

      progress.current = downloadProgress
      updateProgress(progress.current)
    }

    const [mediaUri, setMediaUri] = useState<string | null>(fileUri)

    const componentIsMounted = useRef(true)
    const requestOption = headers ? { headers } : {}
    const downloadResumableRef = useRef(
      FileSystem.createDownloadResumable(
        uri,
        fileUri,
        requestOption,
        _callback,
      ),
    )

    useEffect(() => {
      loadMedia()
      return () => {
        componentIsMounted.current = false
      }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const loadMedia = async () => {
      try {
        // Use the cached media if it exists
        const metadata: FileSystem.FileInfo = await FileSystem.getInfoAsync(
          fileUri,
        )
        const expired =
          expiresIn &&
          'modificationTime' in metadata &&
          new Date().getTime() / 1000 - metadata.modificationTime > expiresIn

        if (!metadata.exists || metadata?.size === 0 || expired) {
          if (componentIsMounted.current) {
            setMediaUri(null)

            if (expired) {
              await FileSystem.deleteAsync(fileUri, { idempotent: true })
            }
            // download to cache
            setMediaUri(null)

            const response = await downloadResumableRef.current.downloadAsync()
            if (response?.status === 200) {
              setMediaUri(`${fileUri}?`) // deep clone to force re-render
            }
            if (response?.status !== 200) {
              FileSystem.deleteAsync(fileUri, { idempotent: true }) // delete file locally if it was not downloaded properly
            }
          }
        }
      } catch (err) {
        console.log({ err })
      }
    }

    if (!mediaUri)
      return (
        placeholderContent({ totalBytesWritten, totalBytesExpectedToWrite }) ||
        null
      )

    if (name === 'CachedVideo') {
      return (
        <Video
          {...(props as VideoProps)}
          source={{
            ...source,
            uri: mediaUri,
          }}
          style={[styles.flexFill, props?.style]}
          videoStyle={[{ width: '100%', height: '100%' }, rest?.videoStyle]}
          ref={ref as React.ForwardedRef<Video>}
        />
      )
    }
    if (name === 'CachedImage' && children) {
      return (
        <ImageBackground
          {...(props as ImageBackgroundProps)}
          source={{
            ...source,
            uri: mediaUri,
          }}
          style={[styles.flexFill, props.style]}
          imageStyle={[{ width: '100%', height: '100%' }, rest?.imageStyle]}
          ref={ref as React.ForwardedRef<ImageBackground>}
        >
          {children}
        </ImageBackground>
      )
    }
    return (
      <Image
        {...(props as ImageProps)}
        source={{
          ...source,
          uri: mediaUri,
        }}
        style={[styles.flexFill, rest?.style]}
        ref={ref as React.ForwardedRef<Image>}
      />
    )
  })

  CachedMediaElement.displayName = name

  return CachedMediaElement
}

const CachedImage = createCachedMediaElement<
  ImageComponent | ImageBackgroundComponent
>('CachedImage')
const CachedVideo = createCachedMediaElement<VideoComponent>('CachedVideo')

export { CacheManager, CachedImage, CachedVideo }

const styles = StyleSheet.create({
  flexFill: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

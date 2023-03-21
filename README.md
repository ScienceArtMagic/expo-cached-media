# expo-cached-media

Super fast cached media components (combined Image/ImageBackground, as well as Video) for React Native applications powered by Expo. Forked from [expo-cached-image](https://github.com/echowaves/expo-cached-image).

## Install

Add to project (with `expo-file-system` and `expo-av` peer dependencies):

```sh
yarn add expo-cached-media expo-file-system expo-av
```

or

```sh
expo install expo-cached-media expo-file-system expo-av
```

## Components

### Shared Props

``` JavaScript
interface CachedMediaURISource {
  uri: string
  headers?: { [key: string]: string }
  expiresIn?: number
}

interface CachedMediaProps {
  source: CachedMediaURISource
  cacheKey?: string
  placeholderContent?: React.ReactElement
  children?: React.ReactNode
  rest?: { [key: string]: any }
}
```

### `CachedImage<CachedMediaProps & (ImageProps | ImageBackgroundProps)>`

```JavaScript
import { CachedImage } from 'expo-cached-media'
```

Then it can be referenced in code like this:

```JavaScript
<CachedImage
  source={{ 
    uri: `${item.getThumbUrl}`, // (required) -- URI of the image to be cached
    headers: `Authorization: Bearer ${token}`, // (optional)            
    expiresIn: 2_628_288, // 1 month in seconds (optional), if not set -- will never expire and will be managed by the OS
  }}
  cacheKey={`${item.id}-thumb`} // (required) -- key to store image locally -- defaults to the filename at the end of the URL (with hash and/or query keys stripped out)
  placeholderContent={( // (optional) -- shows while the image is loading
    <ActivityIndicator // can be any react-native tag
      color={
        CONST.MAIN_COLOR
      }
      size="small"
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    />
  )} 
  resizeMode="contain" // pass-through to <Image /> tag 
  style={ // pass-through to <Image /> tag 
    styles.photoContainer
  }
/>
```

`<CachedImage />` internally uses the `<Image />` and `<ImageBackground />` components from *'react-native'* (`<Image />` if children are NOT specified, `<ImageBackground />` if children ARE), so any properties that apply to the `<Image/>`/`<ImageBackground />` can be passed into the `<CachedImage/>`.

*cacheKey* is the only property that's `<CachedImage />` specific. The same *cacheKey* value should always be passed for the same *source* value. This is a little bit of extra work from an application development point of view (if you choose not to use the default, which gets the filename from the remote URI), but this is how `expo-cached-media` achieves its performance. If not for *cacheKey*, the component would have to use some Crypto hash, which would add computational overhead. If you are rendering lots of images in a list on a screen -- this component will achieve the best performance.

#### `CachedVideo<CachedMediaProps & VideoProps>`

```JavaScript
import { CachedVideo } from 'expo-cached-media'
```

Similar to `CachedImage`, but returns the `Video` component from expo-av (instead of `Image` or `ImageBackground` from react-native). In fact, they're both created by the same internal `createCachedMediaElement()` function.

### CacheManager

Still the same methods as the `CacheManager` object in `expo-cached-image`, but `addToCache` has been renamed to `addToCacheAsync` and `getCachedUri` to `getCachedUriAsync` (in keeping with Expo conventions for async methods).

```JavaScript
import { CacheManager } from 'expo-cached-media'
```

If you have an image on the local file system, which you want to add to the cache, do this:

```JavaScript
photo.getImgUrl = await CacheManager.addToCacheAsync({
  file: `${CONST.PENDING_UPLOADS_FOLDER}${item}`,
  key: `${photo.id}`,
})
```

To get the *local* URI of the cached file by key:

```JavaScript
const uri = await CacheManager.getCachedUriAsync({ key: `${item.id}` })
```

To pre-populate the cache ahead of time from *remote* URI:

```JavaScript
// this is a convenience wrapper for https://docs.expo.dev/versions/latest/sdk/filesystem/#filesystemdownloadasyncuri-fileuri-options
await CacheManager.downloadAsync({
  uri: `${item.url}`,
  key: `${item.id}`
})
```

### Utility functions

``` JavaScript
getProgress(
  totalBytesWritten: number, // size of file (in bytes) currently downloaded
  totalBytesExpectedToWrite: number,// total size of file (in bytes) to download
  decimalPlace?: number // how many digits to display on the right side of the decimal (default 3)
) => number
```

`getProgress()` divides `totalBytesWritten` by `totalBytesExpectedToWrite` and returns a number between 0 and 1. It has a decimal place of 3 (thousandths) by default, but you can optionally remove fractional amounts by specifying a `decimalPlace` value of 0 (e.g. if you need something to run only once the download is complete)

``` JavaScript
getProgressPercent(
  totalBytesWritten: number, // size of file (in bytes) currently downloaded
  totalBytesExpectedToWrite: number,// total size of file (in bytes) to download
  decimalPlace?: number // how many digits to display on the right side of the decimal (default 0)
) => number
```

`getProgressPercent()` divides `totalBytesWritten` by `totalBytesExpectedToWrite` and returns a number between 0 and 100 (integers by default, but you can optionally return fractional amounts by specifying `decimalPlace` with an integer greater than 0)

``` JavaScript
getFileNameFromUri(uri: string)
```

`getFileNameFromUri()` takes a remote image or video URI (e.g. `https://website.com/path/to/video.mp4#hash?query=string`) and strips the remote address (protocol and path, e.g. `https://website.com/path/to`) from the front, as well as any hashes (e.g. `#hash`) and query strings (e.g. `?query=string`) at the end of the address, returning the file name (e.g. `video.mp4`).

This is used internally to provide the default `key` prop value for the `<CachedImage />` and `<CachedVideo />` components.

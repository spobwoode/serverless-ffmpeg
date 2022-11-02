import { getFileInformation, download, uploadFolder, deleteObject, fileExists } from './src/s3'
import { getDestinationBucket, getFfmpegParameters } from './src/env'
import { ffprobe, ffmpeg } from './src/ffmpeg'
import { createReadStream } from 'fs'

export const main = async (event, context, callback) => {
  const {eventName, bucket, key} = getFileInformation(event)

  console.log(`Received ${eventName} for item in bucket: ${bucket}, key: ${key}`)

  if (!key.includes('.png')) {
    callback('not a png file')
    return;
  }

  const mp3filepath = key.replace('.png','.mp3')
  console.log('looking for mp3 file: '+mp3filepath)
  // if (!fileExists(bucket, mp3filepath)) {
  //   callback('corresponding mp3 not found')
  //   return;
  // }

  try {
    const mp3Path = await download(bucket, mp3filepath)
    await ffprobe(mp3Path)
    const pngPath = await download(bucket, key)
    const outputPath = await ffmpeg(mp3Path, pngPath, 'mp4', getFfmpegParameters())
    await uploadFolder(getDestinationBucket(), key, outputPath)
  } catch (error) {
    callback(error)
  }

}
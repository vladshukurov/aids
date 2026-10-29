// Encode a folder of PNG frames into an H.264 MP4 with AVFoundation (no ffmpeg needed).
//   swift scripts/video/encode.swift <frames dir> <out.mp4> [fps]
import AVFoundation
import AppKit

let args = CommandLine.arguments
let dir = URL(fileURLWithPath: args[1]), out = URL(fileURLWithPath: args[2])
let fps = Int32(args.count > 3 ? Int(args[3])! : 30)
let files = try FileManager.default.contentsOfDirectory(atPath: dir.path).filter { $0.hasSuffix(".png") }.sorted()
guard let first = NSImage(contentsOf: dir.appendingPathComponent(files[0])),
      let rep0 = first.representations.first else { fatalError("no frames") }
let w = rep0.pixelsWide, h = rep0.pixelsHigh
try? FileManager.default.removeItem(at: out)
let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: w, AVVideoHeightKey: h,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 10_000_000, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel]
])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: w, kCVPixelBufferHeightKey as String: h
])
writer.add(input); writer.startWriting(); writer.startSession(atSourceTime: .zero)
for (i, f) in files.enumerated() {
  autoreleasepool {
    guard let img = NSImage(contentsOf: dir.appendingPathComponent(f)),
          let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return }
    var pb: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
    guard let buf = pb else { return }
    CVPixelBufferLockBaseAddress(buf, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(buf), width: w, height: h, bitsPerComponent: 8,
                        bytesPerRow: CVPixelBufferGetBytesPerRow(buf), space: CGColorSpaceCreateDeviceRGB(),
                        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
    CVPixelBufferUnlockBaseAddress(buf, [])
    while !input.isReadyForMoreMediaData { usleep(2000) }
    adaptor.append(buf, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps))
  }
}
input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
print("\(out.path): \(files.count) frames, \(w)×\(h) @ \(fps) fps")

/** Canvas-only recording. No microphone, screen capture or external upload. */
export async function record(canvas, name) {
  if (document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches)
    throw Error('Keep the preview visible and enable motion to record')
  const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8'].find(
    (x) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(x),
  )
  if (!mime || !canvas?.captureStream) throw Error('Canvas video recording unavailable')
  const stream = canvas.captureStream(30),
    chunks = []
  let recorder, timer, watchdog
  try {
    const blob = await new Promise((resolve, reject) => {
      let done = false
      const finish = (error) => {
        if (done) return
        done = true
        error ? reject(error) : resolve(new Blob(chunks, { type: mime }))
      }
      recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5000000 })
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data)
      }
      recorder.onerror = () => finish(Error('Recording failed'))
      recorder.onstop = () => finish(chunks.length ? null : Error('No frames recorded'))
      recorder.start(100)
      timer = setTimeout(() => recorder.stop(), 10000)
      watchdog = setTimeout(() => finish(Error('Recording timed out')), 15000)
    })
    const url = URL.createObjectURL(blob),
      link = document.createElement('a')
    link.href = url
    link.download = name + '.webm'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  } finally {
    clearTimeout(timer)
    clearTimeout(watchdog)
    if (recorder?.state === 'recording') recorder.stop()
    stream.getTracks().forEach((t) => t.stop())
  }
}

export const startCamera = async (
  videoElement: HTMLVideoElement | null,
  setStreaming: (val: boolean) => void,
  onStart?: () => void
) => {
  if (!videoElement) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    videoElement.play();
    setStreaming(true);
    onStart?.();
  } catch (error) {
    alert("Failed to access camera: " + error);
  }
};

export const stopCamera = (videoElement: HTMLVideoElement | null) => {
  if (!videoElement) return;
  const stream = videoElement.srcObject as MediaStream;
  stream?.getTracks().forEach((track) => track.stop());
  videoElement.srcObject = null;
};

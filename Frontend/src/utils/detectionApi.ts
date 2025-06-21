import axios from "axios";

export type DetectionDetail = {
  label: string;
  value: number;
};

export const sendImageToApi = async (
  file: File,
  setResultImageSrc: (src: string) => void,
  setDetectionDetails: (data: DetectionDetail[]) => void,
  setIsModalOpen: (v: boolean) => void,
  setLoading: (v: boolean) => void
) => {
  setLoading(true);
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post("http://localhost:5000/detect", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const data = response.data;
    let imageUrl = data.result_image;
    if (!imageUrl.startsWith("http")) {
      imageUrl = "http://localhost:5000/" + imageUrl.replace(/^\/?/, "");
    }

    setResultImageSrc(imageUrl);
    setDetectionDetails(parseDetectionDetails(data.details));
    setIsModalOpen(true);
  } catch (err) {
    alert("Detection failed: " + err);
  } finally {
    setLoading(false);
  }
};

const parseDetectionDetails = (details: string[]): DetectionDetail[] => {
  return details.map((detail) => {
    const [label, val] = detail.split(":").map((item) => item.trim());
    return {
      label,
      value: parseFloat(val) || 0,
    };
  });
};

import { FC, useRef, useState } from "react";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import ReactCrop, {
  centerCrop,
  Crop,
  makeAspectCrop,
  PercentCrop,
  PixelCrop,
} from "react-image-crop";
import { Box, Stack, Typography } from "@mui/material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useIntl } from "react-intl";

interface Props {
  circularCrop?: boolean,
  open: boolean;
  imgSrc: string;
  handleClose: () => void;
  handleCrop: (value: string) => void;
  displayPreview?: boolean;
}

const MIN_DIMENSION = 150;

const MIN_WIDTH_RECTANGLE = 150;
const MIN_HEIGHT_RECTANGLE = 100;

export async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop
) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;
  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );
  ctx.restore();
}
export const ImageCropper: FC<Props> = ({
  open,
  handleClose,
  imgSrc,
  handleCrop,
  circularCrop = false,
  displayPreview = false
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [croppedImage, setCroppedImage] = useState("");
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intl = useIntl();

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: cropWidthInPercent,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const onCropComplete = (crop: PixelCrop, pixelCrop: PercentCrop) => {
    if (!imgSrc || imageRef.current === null) return;
    const canvas = document.createElement("canvas");
    canvasPreview(imageRef.current, canvas, crop);
    const base64 = canvas.toDataURL();
    setCroppedImage(base64);
  };
  return (
    <CustomisedModal open={open} handleClose={handleClose} maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h5">
          {intl.formatMessage({ id: "PROFILE.CROP_IMAGE" })}
        </Typography>
        <ReactCrop
          crop={crop}
          onChange={(pixelCrop, percentCrop) => {
            setCrop(percentCrop);
          }}
          circularCrop={circularCrop}
          keepSelection
          aspect={circularCrop ? 1 : undefined}
          minHeight={circularCrop ? MIN_DIMENSION : MIN_HEIGHT_RECTANGLE}
          minWidth={circularCrop ? MIN_DIMENSION : MIN_WIDTH_RECTANGLE}
          onComplete={onCropComplete}
          className="mx-auto"
        >
          <img
            style={{
              maxWidth: "400px",
              objectFit: "contain",
            }}
            ref={imageRef}
            src={imgSrc}
            alt="profile-preview"
            onLoad={onImageLoad}
          />
        </ReactCrop>
        {
          displayPreview &&
          <Box >
            <canvas ref={canvasRef} className="logo-preview-container" />
          </Box>
        }
        <Stack direction={"row"} spacing={1} className="justify-content-end">
          <CustomisedButton
            label={intl.formatMessage({ id: "BUTTON.CANCEL" })}
            variant="outlined"
            handleClick={handleClose}
          />
          <CustomisedButton
            label={intl.formatMessage({ id: "BUTTON.CROP" })}
            handleClick={() => handleCrop(croppedImage)}
          />
        </Stack>
      </Stack>
    </CustomisedModal >
  );
};

import { IconButton } from "@mui/material";
import { useTourStore } from "../../store/tourStore";
import Icon from "../../assets/icons";

const TourAudioButton = () => {
  const isAudioEnabled = useTourStore((state) => state.isAudioEnabled);
  const toggleAudioEnabled = useTourStore((state) => state.toggleAudioEnabled);

  return (
    <IconButton className="btn-audio" onClick={toggleAudioEnabled}>
      {isAudioEnabled ? (
        <Icon icon="eva:volume-up-fill" width="30" height="30" />
      ) : (
        <Icon icon="eva:volume-off-fill" width="30" height="30" />
      )}
    </IconButton>
  );
};

export default TourAudioButton;

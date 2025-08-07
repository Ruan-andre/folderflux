type IconOption = {
  value: string;
  icon: string;
};

// (essa lógica futuramente será alterada para um gerenciador de ícones)
const CommonIcons: IconOption[] = [
  { value: "home", icon: "fluent-color:home-32" },
  { value: "briefcase", icon: "noto:briefcase" },
  { value: "smartphone", icon: "flat-color-icons:two-smartphones" },
  { value: "music", icon: "emojione-v1:music-descend" },
  { value: "camera", icon: "noto:camera" },
  { value: "folder", icon: "fluent-emoji:file-folder" },
];

export default CommonIcons;

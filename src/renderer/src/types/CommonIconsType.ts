type IconOption = {
  value: "home" | "briefcase" | "smartphone" | "music" | "camera" | "folder" | "folder-error" | "clean";
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
  { value: "folder-error", icon: "material-icon-theme:folder-error-open" },
  { value: "clean", icon: "streamline-plump-color:clean-broom-wipe-flat" },
];

export default CommonIcons;

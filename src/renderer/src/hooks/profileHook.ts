import { useState } from "react";
import { FolderSchema } from "~/src/db/schema";
import { FullRule } from "~/src/shared/types/RuleWithDetails";

export interface ProfileFormData {
  id: number;
  name: string;
  description: string;
  icon: string;
  associatedFolders: FolderSchema[];
  associatedRules: FullRule[];
}

export const useProfileForm = () => {
  const [id, setId] = useState<number>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("fluent-color:home-32");
  const [icon, setIcon] = useState("");
  const [associatedFolders, setAssociatedFolders] = useState<FolderSchema[]>([]);
  const [associatedRules, setAssociatedRules] = useState<FullRule[]>([]);

  const reset = (data: Partial<ProfileFormData> = {}) => {
    setId(data.id || undefined);
    setName(data.name || "");
    setDescription(data.description || "");
    setIcon(data.icon || "fluent-color:home-32");
    setAssociatedFolders(data.associatedFolders || []);
    setAssociatedRules(data.associatedRules || []);
  };

  return {
    id,
    name,
    setName,
    description,
    setDescription,
    icon,
    setIcon,
    associatedFolders,
    setAssociatedFolders,
    associatedRules,
    setAssociatedRules,
    reset,
  };
};

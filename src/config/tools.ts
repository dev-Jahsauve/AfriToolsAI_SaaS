import type { ComponentType } from "react";
import type { IconProps } from "../components/icons";
import {
  BoxIcon,
  MegaphoneIcon,
  MessageCircleIcon,
  SmartphoneIcon,
  TargetIcon,
} from "../components/icons";

export type ToolId =
  | "fiche-produit"
  | "publicite"
  | "publication-sociale"
  | "messages-whatsapp"
  | "offre-commerciale";

export interface ToolMeta {
  id: ToolId;
  path: string;
  label: string;
  title: string;
  description: string;
  gradient: string;
  Icon: ComponentType<IconProps>;
}

export const TOOLS: ToolMeta[] = [
  {
    id: "fiche-produit",
    path: "/dashboard/fiche-produit",
    label: "Fiche produit",
    title: "Générateur de fiche produit",
    description: "Créez une fiche produit professionnelle et persuasive en quelques secondes.",
    gradient: "from-blue-500 to-indigo-600",
    Icon: BoxIcon,
  },
  {
    id: "publicite",
    path: "/dashboard/publicite",
    label: "Publicité",
    title: "Générateur de publicité",
    description: "Créez des textes publicitaires percutants pour toutes vos plateformes.",
    gradient: "from-purple-500 to-violet-600",
    Icon: MegaphoneIcon,
  },
  {
    id: "publication-sociale",
    path: "/dashboard/publication-sociale",
    label: "Publication sociale",
    title: "Générateur de publication sociale",
    description: "Créez des posts engageants optimisés pour chaque réseau social.",
    gradient: "from-pink-500 to-rose-600",
    Icon: SmartphoneIcon,
  },
  {
    id: "messages-whatsapp",
    path: "/dashboard/messages-whatsapp",
    label: "Messages WhatsApp",
    title: "Générateur de messages WhatsApp",
    description: "Créez des messages naturels et professionnels pour chaque situation.",
    gradient: "from-green-500 to-emerald-600",
    Icon: MessageCircleIcon,
  },
  {
    id: "offre-commerciale",
    path: "/dashboard/offre-commerciale",
    label: "Offre commerciale",
    title: "Générateur d'offre commerciale",
    description: "Transformez n'importe quelle réduction en offre irrésistible avec plusieurs variantes.",
    gradient: "from-orange-500 to-amber-600",
    Icon: TargetIcon,
  },
];

export const toolById = (id: string | ToolId): ToolMeta | null =>
  TOOLS.find((t) => t.id === id) ?? null;

export const toolByPath = (path: string): ToolMeta | null =>
  TOOLS.find((t) => t.path === path) ?? null;

export const toolLabel = (id: string | ToolId): string => toolById(id)?.label ?? id;
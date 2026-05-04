/**
 * ICÔNES UNIFIÉES - MBOA MARKET
 * Toutes les icônes de l'application en un seul endroit
 * Utilise React Icons pour agriculture/élevage et Lucide pour UI
 */

// ========== AGRICULTURE & ÉLEVAGE (React Icons) ==========
import { 
  GiFarmTractor,
  GiWheat,
  GiCorn,
  GiCarrot,
  GiCow,
  GiChicken,
  GiPig,
  GiSheep,
  GiFarmer,
  GiPlantSeed,
  GiGrainBundle,
  GiMilkCarton,
} from 'react-icons/gi';

import {
  FaSeedling,
  FaLeaf,
  FaTree,
  FaAppleAlt,
  FaFish,
  FaEgg,
} from 'react-icons/fa';

// ========== UI & NAVIGATION (Lucide) ==========
import { 
  Home,
  MessageCircle,
  Heart,
  MapPin,
  Package,
  Plus,
  X,
  ShoppingCart,
  Globe,
  Send,
  Search,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Star,
  Activity,
  ShoppingBag,
  Truck,
  BarChart3,
  Mic,
  MicOff,
  Volume2,
  User,
  Users,
  Settings,
  Bell,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Grid,
  List,
  Edit,
  Mail,
  Phone,
  Shield,
  Lock,
  Database,
  Key,
  Server,
  Eye,
  FileCheck,
  Sun,
  Moon,
  Bot,
  Loader,
  ThumbsUp,
  MessageSquare,
  GraduationCap,
  Lightbulb,
  BookOpen,
  DollarSign,
  Calendar,
  AlertTriangle,
  Cloud,
  Droplet,
  ThermometerSun,
  Bug,
  Droplets,
  LineChart,
  Menu,
  CheckCircle,
  ArrowUp,
} from 'lucide-react';

// ========== EXPORTS AGRICULTURE ==========
export const TractorIcon = GiFarmTractor;
export const WheatIcon = GiWheat;
export const CornIcon = GiCorn;
export const CarrotIcon = GiCarrot;
export const SeedIcon = GiPlantSeed;
export const GrainsIcon = GiGrainBundle;
export const FarmerIcon = GiFarmer;
export const SproutIcon = FaSeedling;  // Remplace Sprout de Lucide
export const LeafIcon = FaLeaf;
export const TreeIcon = FaTree;
export const AppleIcon = FaAppleAlt;

// ========== EXPORTS ÉLEVAGE ==========
export const CowIcon = GiCow;  // Remplace Beef de Lucide
export const ChickenIcon = GiChicken;
export const PigIcon = GiPig;
export const SheepIcon = GiSheep;
export const MilkIcon = GiMilkCarton;
export const FishIcon = FaFish;
export const EggIcon = FaEgg;

// ========== EXPORTS UI (Lucide - inchangé) ==========
export {
  Home,
  MessageCircle,
  Heart,
  MapPin,
  Package,
  Plus,
  X,
  ShoppingCart,
  Globe,
  Send,
  Search,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Star,
  Activity,
  ShoppingBag,
  Truck,
  BarChart3,
  Mic,
  MicOff,
  Volume2,
  User,
  Users,
  Settings,
  Bell,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Grid,
  List,
  Edit,
  Mail,
  Phone,
  Shield,
  Lock,
  Database,
  Key,
  Server,
  Eye,
  FileCheck,
  Sun,
  Moon,
  Bot,
  Loader,
  ThumbsUp,
  MessageSquare,
  GraduationCap,
  Lightbulb,
  BookOpen,
  DollarSign,
  Calendar,
  AlertTriangle,
  Cloud,
  Droplet,
  ThermometerSun,
  Bug,
  Droplets,
  LineChart,
  Menu,
  CheckCircle,
  ArrowUp,
};

// Alias pour compatibilité
export const Beef = CowIcon;  // Beef -> Cow
export const Sprout = SproutIcon;  // Sprout -> Seedling
export const Leaf = LeafIcon;
export const Wheat = WheatIcon;
export const Tractor = TractorIcon;
export const PackageSearch = Truck;  // Fournisseur = Camionnette de livraison

import { create } from 'zustand';

import type {
  ModifierGroupListItem,
  ModifierListItem,
  ProductListItem,
  StockItem,
  StockMovementType,
} from '@/types/models';

type UiState = {
  closeManualItemModal: () => void;
  closeModifierGroupEditor: () => void;
  closeModifierModal: () => void;
  closeModifierSelection: () => void;
  closeProductModal: () => void;
  closeStockItemModal: () => void;
  closeStockMovementModal: () => void;
  editingModifier: ModifierListItem | null;
  editingModifierGroup: ModifierGroupListItem | null;
  editingProduct: ProductListItem | null;
  isManualItemModalOpen: boolean;
  isModifierGroupModalOpen: boolean;
  isModifierModalOpen: boolean;
  isModifierSelectionOpen: boolean;
  isProductModalOpen: boolean;
  isStockItemModalOpen: boolean;
  isStockMovementModalOpen: boolean;
  movementTarget: StockItem | null;
  movementType: StockMovementType;
  openManualItemModal: () => void;
  openModifierEditor: (modifier?: ModifierListItem | null) => void;
  openModifierGroupEditor: (group?: ModifierGroupListItem | null) => void;
  openModifierSelection: (product: ProductListItem) => void;
  openProductModal: (product?: ProductListItem | null) => void;
  openStockItemModal: () => void;
  openStockMovementModal: (item: StockItem, type: StockMovementType) => void;
  selectedCartProduct: ProductListItem | null;
};

export const useUiStore = create<UiState>((set) => ({
  editingModifier: null,
  editingModifierGroup: null,
  editingProduct: null,
  isManualItemModalOpen: false,
  isModifierGroupModalOpen: false,
  isModifierModalOpen: false,
  isModifierSelectionOpen: false,
  isProductModalOpen: false,
  isStockItemModalOpen: false,
  isStockMovementModalOpen: false,
  movementTarget: null,
  movementType: 'entrada',
  selectedCartProduct: null,

  closeManualItemModal() {
    set({ isManualItemModalOpen: false });
  },

  closeModifierGroupEditor() {
    set({
      editingModifierGroup: null,
      isModifierGroupModalOpen: false,
    });
  },

  closeModifierModal() {
    set({
      editingModifier: null,
      isModifierModalOpen: false,
    });
  },

  closeModifierSelection() {
    set({
      isModifierSelectionOpen: false,
      selectedCartProduct: null,
    });
  },

  closeProductModal() {
    set({
      editingProduct: null,
      isProductModalOpen: false,
    });
  },

  closeStockItemModal() {
    set({ isStockItemModalOpen: false });
  },

  closeStockMovementModal() {
    set({
      isStockMovementModalOpen: false,
      movementTarget: null,
      movementType: 'entrada',
    });
  },

  openManualItemModal() {
    set({ isManualItemModalOpen: true });
  },

  openModifierEditor(modifier = null) {
    set({
      editingModifier: modifier,
      isModifierModalOpen: true,
    });
  },

  openModifierGroupEditor(group = null) {
    set({
      editingModifierGroup: group,
      isModifierGroupModalOpen: true,
    });
  },

  openModifierSelection(product) {
    set({
      isModifierSelectionOpen: true,
      selectedCartProduct: product,
    });
  },

  openProductModal(product = null) {
    set({
      editingProduct: product,
      isProductModalOpen: true,
    });
  },

  openStockItemModal() {
    set({ isStockItemModalOpen: true });
  },

  openStockMovementModal(item, type) {
    set({
      isStockMovementModalOpen: true,
      movementTarget: item,
      movementType: type,
    });
  },
}));

export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
}

export interface BrandDTO {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
}

export interface ProductVariantDTO {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  volumeMl?: number;
  weightG?: number;
  imageUrl?: string;
}

export interface ProductImageDTO {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface IngredientDTO {
  id: number;
  name: string;
  slug: string;
  description?: string;
  safetyRating?: number; // EWG safety rating
  isKeyIngredient: boolean;
}

export interface ReviewSummaryDTO {
  averageRating: number;
  totalReviews: number;
}

export interface ProductDTO {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  howToUse?: string;
  
  category: CategoryDTO;
  brand: BrandDTO;
  
  basePrice: number;
  salePrice?: number;
  discountPercent?: number;
  
  usageStep?: string;
  suitableSkinTypes: string[];
  skinConcerns: string[];
  
  volumeMl?: number;
  weightG?: number;
  shelfLifeMonths?: number;
  
  isFeatured: boolean;
  isNewArrival: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  
  viewCount: number;
  soldCount: number;
  
  variants: ProductVariantDTO[];
  images: ProductImageDTO[];
  keyIngredients: IngredientDTO[];
  tags: string[];
  
  reviewSummary?: ReviewSummaryDTO;
  
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummaryDTO {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  
  categoryName: string;
  brandName: string;
  
  price: number; // computed price (variant or base/sale)
  originalPrice?: number;
  discountPercent?: number;
  
  primaryImageUrl?: string;
  
  isNewArrival: boolean;
  isFeatured: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  
  tags: string[];
  
  averageRating?: number;
  totalReviews?: number;
  soldCount: number;
}

export interface ProductFilterRequest {
  query?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  skinType?: string;
  skinConcern?: string;
  sortBy?: 'name,asc' | 'price,asc' | 'price,desc' | 'soldCount,desc' | 'createdAt,desc';
}

export interface CategoryTreeDTO {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  subCategories: CategoryTreeDTO[];
}

export type IngredientSafetyLevel = 'SAFE' | 'CAUTION' | 'AVOID';

export interface IngredientSafetyDTO {
  ingredientName: string;
  status: IngredientSafetyLevel;
  reason: string;
}

export interface IngredientConflictDTO {
  ingredientA: string;
  ingredientB: string;
  severity: string;
  reason: string;
}

export interface CheckIngredientSafetyRequest {
  ingredientNames: string[];
  skinType?: string;
}

export interface CheckIngredientConflictsRequest {
  ingredientNames: string[];
}

export interface ProductStatsDTO {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  productsByCategory: Record<string, number>;
  productsByBrand: Record<string, number>;
}

export interface UpdateVariantRequest {
  name?: string;
  sku?: string;
  price?: number;
  salePrice?: number;
  stockQuantity?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
  displayOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CreateBrandRequest {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
}

export interface UpdateBrandRequest extends Partial<CreateBrandRequest> {}

export interface CreateIngredientRequest {
  name: string;
  slug?: string;
  description?: string;
  safetyRating?: number;
  isKeyIngredient?: boolean;
}

export interface UpdateIngredientRequest extends Partial<CreateIngredientRequest> {}

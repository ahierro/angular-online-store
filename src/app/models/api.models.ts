export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterUserDTO {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreationDTO {
  id: string;
  name: string;
  description: string;
}

export interface CategoryUpdateDTO {
  name: string;
  description: string;
}

export interface ProductDTO {
  productId: string;
  productName: string;
  productDescription: string;
  stock: number;
  price: number;
  smallImageUrl: string;
  bigImageUrl: string;
  createdAt?: string;
  updatedAt?: string;
  category: CategoryDTO;
}

export interface ProductCreationDTO {
  productId: string;
  productName: string;
  productDescription: string;
  stock: number;
  price: number;
  smallImageUrl: string;
  bigImageUrl: string;
  categoryId: string;
}

export interface ProductUpdateDTO {
  productName: string;
  productDescription: string;
  stock: number;
  price: number;
  smallImageUrl: string;
  bigImageUrl: string;
  categoryId: string;
}

export interface PurchaseOrderLineCreationDTO {
  idProduct: string;
  quantity: number;
}

export interface PurchaseOrderCreationDTO {
  id: string;
  lines: PurchaseOrderLineCreationDTO[];
  total: number;
}

export interface PurchaseOrderLineDTO {
  quantity: number;
  product: ProductDTO;
}

export interface PurchaseOrderListItemDTO {
  id: string;
  idUser: string;
  total: number;
  status: string;
  createdAt?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PurchaseOrderDTO {
  id: string;
  lines: PurchaseOrderLineDTO[];
  total: number;
  status: string;
  createdAt?: string;
  user?: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface PurchaseOrderStatusUpdateDTO {
  status: string;
}

export interface PageRequestDTO {
  page: number;
  size: number;
}

export interface ProductPageRequestDTO extends PageRequestDTO {
  categoryId?: string;
  queryString?: string;
  sortByPrice?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface ProductPage extends PageResponse<ProductDTO> {}
export interface CategoryPage extends PageResponse<CategoryDTO> {}
export interface PurchaseOrderPage extends PageResponse<PurchaseOrderListItemDTO> {}

export interface UserInfo {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface ValidationError {
  objectName: string;
  field: string;
  rejectedValue: unknown;
  codes: string[];
  arguments: unknown[];
  bindingFailure: boolean;
  code: string;
  defaultMessage: string;
}

export interface BackendErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  trace?: string;
  message: string;
  errors?: ValidationError[];
  path: string;
}


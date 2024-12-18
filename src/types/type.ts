/**
 *    |1 | |   2  |  |     3       |
 * -> Omit<SomeType, "Key1" | "Key2">
 */
export interface GenericityTypeItem {
  /* 1 */
  type: string | symbol;
  typeArgs: [
    /* 2 */
    string | GenericityTypeItem | NormalTypeItems,
    /* 3 */
    ...string[],
  ];
}

export const unionType = Symbol("union");

/**
 *
 * A | B | C
 *
 */
export type UnionTypeItem = {
  typeArgs: (string | GenericityTypeItem | NormalTypeItems)[];
};

export const intersectionType = Symbol("intersection");

/**
 *
 * A & B & C
 *
 */
export type IntersectionTypeItem = {
  typeArgs: (string | GenericityTypeItem | NormalTypeItems)[];
};

/**
 *          string       GenericityTypeItem                        NormalTypeItems
 *            |            |                                         |
 *           \|/          \|/                                       \|/
 * -> { name: string; age: Omit<SomeType, "Key1" | "Key2">; address: { code: string; location: string } }
 */
export type NormalTypeItem = {
  // in: string;
  name: string;
  required?: boolean;
  deprecated?: boolean;
  type: string | GenericityTypeItem | NormalTypeItems | UnionTypeItem;
};

export type NormalTypeItems = NormalTypeItem[];

export interface NormalType extends Omit<NormalTypeItem, "required"> {
  modifier?: string[];
}

export type MaybeType = NormalType;

export type TypeParameter = {
  name: string;
};

export const isTypeParameter = (t: unknown): t is TypeParameter =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
  !!((t as any).name && Object.keys(t as any).length === 1);

export type TypeKeyword = TypeParameter;

export type PropertySignature = {
  name: string;
  type: string | TypeLiteral | TypeReference;
};

export const isPropertySignature = (t: unknown): t is PropertySignature =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
  !!((t as any).name && (t as any).type && Object.keys(t as any).length === 2);

export type TypeLiteral = {
  members: PropertySignature[];
};

export type IntersectionType = {
  name: symbol;
  types: (TypeParameter | TypeLiteral | TypeReference)[];
};

export const isIntersectionType = (t: unknown): t is IntersectionType =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
  !!((t as any).name && (t as any).name === intersectionType && Object.keys(t as any).length === 2);

export type UnionType = {
  name: symbol;
  types: (TypeParameter | TypeLiteral | TypeReference)[];
};

export const isUnionType = (t: unknown): t is UnionType =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
  !!((t as any).name && (t as any).name === unionType && Object.keys(t as any).length === 2);

export type TypeReference = {
  typeName: string;
  typeArguments?: (TypeParameter | TypeLiteral | TypeReference | UnionType | IntersectionType)[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
export const isTypeReference = (t: unknown): t is TypeReference => !!(t as any).typeName;

export type ArrayType = {
  elementType: string | TypeParameter | TypeLiteral | TypeReference | IntersectionType | UnionType;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
export const isArrayType = (t: unknown): t is ArrayType => !!(t as any).elementType;

export type TypeAlias = {
  name: string;
  modifier?: string[];
  typeParameters?: ArrayType["elementType"][];
  type?: ArrayType["elementType"];
};

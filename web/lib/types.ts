/**
 * Strapi content type definitions.
 * Mirrors cms/src/api/*/content-types/*/schema.json
 *
 * Strapi 5 wraps every entry in `{ id, documentId, ...attributes, createdAt, updatedAt, publishedAt }`
 * and lists in `{ data: T[], meta: { pagination } }`.
 */

import type { ReactNode } from 'react';

export interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
  mime: string;
}

export interface StrapiImage {
  id: number;
  documentId?: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, StrapiImageFormat>;
}

export interface SEOComponent {
  id: number;
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: StrapiImage | null;
}

export interface ContactComponent {
  id: number;
  phone: string;
  email: string;
  address: string;
  wechatId: string;
}

export interface NavMenuItem {
  label: string;
  href: string;
}

export interface HomePage {
  id: number;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle?: string;
  ctaPrimaryLabel: string;
  ctaPrimaryLink: string;
  ctaSecondaryLabel: string;
  ctaSecondaryLink: string;
  heroBackground?: StrapiImage | null;
  seo?: SEOComponent | null;
}

export interface MultimodalPage {
  id: number;
  coreAdvantageTitle: string;
  coreAdvantageDesc?: string;
  solutions?: Solution[];
  seo?: SEOComponent | null;
}

export interface AIApplicationPage {
  id: number;
  coreAdvantageTitle: string;
  coreAdvantageDesc?: string;
  solutions?: Solution[];
  seo?: SEOComponent | null;
}

export interface AboutPage {
  id: number;
  pageTitle: string;
  visionTitle: string;
  visionContent?: string;
  contact?: ContactComponent | null;
  seo?: SEOComponent | null;
}

export type SolutionCategory = 'multimodal' | 'ai_application';

export interface Solution {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  category: SolutionCategory;
  description?: string;
  coverImage?: StrapiImage | null;
  order: number;
  tags?: string[] | null;
  seo?: SEOComponent | null;
}

export interface SiteSetting {
  id: number;
  documentId?: string;
  logo?: StrapiImage | null;
  logoSubtitle?: string;
  navMenu?: NavMenuItem[];
  footerText?: string;
  icpNumber?: string;
  analyticsBaidu?: string;
  analyticsGa?: string;
  contactEmailTo?: string;
}

export type InquiryInterest = 'multimodal' | 'ai' | 'other';
export type InquiryStatus = 'pending' | 'processing' | 'contacted' | 'closed';

export interface Inquiry {
  id: number;
  documentId?: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  interest: InquiryInterest;
  message: string;
  sourcePage?: string;
  status: InquiryStatus;
  handledAt?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryInput {
  name: string;
  company: string;
  email: string;
  phone?: string;
  interest: InquiryInterest;
  message: string;
  sourcePage?: string;
  turnstileToken?: string;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T | null;
  error?: { status: number; name: string; message: string };
}

export interface StrapiCreateResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface SearchableSolution {
  id: number;
  title: string;
  category: SolutionCategory;
  description?: string;
  href: string;
  tags?: string[];
}

export interface SearchablePage {
  id: number;
  title: string;
  href: string;
  excerpt?: string;
}

export type SearchIndexItem =
  | ({ type: 'solution' } & SearchableSolution)
  | ({ type: 'page' } & SearchablePage);

// Helper to render rich-text markdown-ish content (Strapi blocks minimal)
export type RichText = ReactNode;

'use client';

import { lazy } from 'react';

// Lazy load heavy components
export const LazySwapPage = lazy(() => import('../swap/page'));
export const LazyLiquidityPage = lazy(() => import('../liquidity/page'));
export const LazyAutoStakePage = lazy(() => import('../autostake/page'));
export const LazyCreateTokenPage = lazy(() => import('../create/page'));

// Lazy load modals and complex components
export const LazyTokenCreationModal = lazy(() => import('./TokenCreationModal').then(module => ({ default: module.TokenCreationModal })));
export const LazyTokenFormStep1 = lazy(() => import('./token-creation/TokenFormStep1').then(module => ({ default: module.TokenFormStep1 })));
export const LazyTokenFormStep2 = lazy(() => import('./token-creation/TokenFormStep2').then(module => ({ default: module.TokenFormStep2 })));
export const LazyTokenFormStep3 = lazy(() => import('./token-creation/TokenFormStep3').then(module => ({ default: module.TokenFormStep3 })));

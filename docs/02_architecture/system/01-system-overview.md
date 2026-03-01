---
title: System Overview & Core Objectives
author: Data Architecture Director
created_date: 2026-02-25
last_updated: "2026-02-27"
status: Active
---

# 01. 시스템 개요 및 핵심 목표 (System Overview & Core Objectives)

**site URL (www.mellowave.me)**

> **목적**: Mellow Wave의 전반적인 서비스 비전, 단기 및 장기 목표, 그리고 이를 지탱하기 위해 도입된 **서버리스(Serverless) 및 데이터 주도(Data-Driven) 아키텍처**의 근본적인 전환 배경을 서술합니다.

---

## 1. 서비스 목표 (Service Roadmaps)

Mellow Wave는 단순한 일회성 심리테스트 모음 사이트가 아닌, **데이터 기반의 심리 분석 및 커뮤니티 플랫폼**으로 진화하는 것을 목표로 합니다.

### 단기 목표 (Phase 1 & 2)
1. **메인 화면 및 테스트 카탈로그**: 직관적인 UI(1200x330 파노라마 배너 중심)를 가진 반응형 웹 애플리케이션 구축.
2. **단일 심리테스트 고도화 (`island_test`)**: "무인도 생존 유형 테스트"의 질문지 현실성 증대, 공감성 높은 해설 작성, 그리고 철저한 로그 수집(Telemetry).
3. **마이페이지(My Page)**: 유저의 심리테스트 결과값(개인 파라미터, 예: `6xxx24sx`)을 저장하고 열람할 수 있는 개인화 공간 마련. 개인 파라미터 가중치를 활용한 AI 기반 마이프로필 이미지 렌더링.

### 중장기 목표 (Phase 3+)
1. **유료화 서비스 파이프라인**: 심리테스트 데이터와 연계된 딥다이브 유료 콘텐츠(타로점, 사주풀이 AI 챗봇 등) 런칭.
2. **유저 참여형 템플릿**: 관리자가 아닌 일반 유저가 직접 심리테스트를 제작하고 배포할 수 있는 템플릿 제너레이터(Creator Studio) 구축.
3. **커뮤니티 확장**: 자체 개발한 정교한 성격 테스트 알고리즘을 기반으로 유저 간 소통을 유도하는 커뮤니티 사이트로 진화.

---

## 2. 아키텍처 전환 배경 (Architectural Shift)

초기 프로토타입의 기술 부채(Technical Debt)를 청산하고, 상용화와 템플릿화라는 최종 목표를 위해 백엔드 구조를 근본적으로 개편했습니다.

### ❌ 레거시 모놀리식 (Legacy Monolithic)의 한계
* **하드코딩된 데이터 모델**: 결과 화면의 텍스트나 이미지 경로가 HTML/JS 내부에 하드코딩되어, 사소한 텍스트 수정에도 전체 빌드/배포 사이클이 요구됨.
* **비효율적인 에셋 페이로드**: `.png` 등 무거운 원본 이미지를 그대로 로드하여 LCP(Largest Contentful Paint) 속도가 치명적으로 저하됨.

### ✅ 최종 구현: 서버리스 & 데이터-드리븐 (Serverless & Data-Driven)
* **API 중심의 렌더링**: 프론트엔드와 데이터의 생명주기를 완벽히 분리. 배너 URL이나 해설 텍스트 등을 프론트엔드 하드코딩이 아닌 Database Fetch 방식으로 설계하여 런타임에 동적으로 컴포넌트들을 렌더링합니다. (향후 "템플릿화"의 필수 전제조건)
* **Supabase 기반 서버리스 연동**: Database(Postgres), Storage(CDN), Edge Functions 연동을 원스톱으로 처리하는 BaaS를 채택하여 인프라 관리 비용을 제로화.
* **CDN 및 WebP 스트리밍**: 무거운 정적 자원들을 **Supabase CDN (`test_image` 버킷)** 으로 이관. Node.js 배치 스크립트(`upload_banners.js`)를 통해 **WebP 포맷**으로 일괄 압축/변환하여 평균 용량을 80% 이상 절감.

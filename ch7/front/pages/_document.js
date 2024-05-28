// # 공통 사용 <html>, <head>, <body>
// 비고: _app.js를 한 번 감쌈

// 1. 필요 라이브러리 가져오기
import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

// 2. MyDocument 컴포넌트:
// NodeBird 앱의 전역적인 HTML 문서 구조, 서버 측 렌더링의 초기 설정
export default class MyDocument extends Document {
  // 2.1 서버 측에서 페이지 렌더링하기 전에 호출되어 초기 props 설정
  static async getInitialProps(ctx) {
    // 2.1.1 스타일 처리 도구, 페이지 렌더링 함수 불러오기
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      // 2.1.2 컴포넌트 스타일 수집
      ctx.renderPage = () => originalRenderPage({
        enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
      });

      // 2.1.3 초기 props 가져오기
      const initialProps = await Document.getInitialProps(ctx);

      // 2.1.4 서버에서 수집한 스타일 반환:
      // 서버 측에서 렌더링된 스타일이 클라이언트로 전송되도록 함
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } catch (error) {
      console.error(error);
    } finally {
      // 2.1.5 서버에서 수집한 스타일 시트 봉인:
      // 스타일 시트의 무결성을 보장하여, 서버에서 수집한 스타일이 안전하게 클라이언트로 전달/적용되게 함
      sheet.seal();
    }
  }

  // 2.2 서버 측 렌더링을 위한 HTML 문서의 기본 구조 정의
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

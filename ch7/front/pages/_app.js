// # 공통 레이아웃

// 1. 필요 라이브러리, 구성 요소 가져오기
import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import 'antd/dist/antd.css';

import wrapper from '../store/configureStore';

// 2. NodeBird 앱의 기본 레이아웃 정의
const NodeBird = ({ Component }) => (
  <>
    <Head>
      <meta charSet="utf-8" />
      <title>NodeBird</title>
    </Head>
    <Component />
  </>
);

// 3. Prop Types 정의:
// NodeBird 컴포넌트의 props가 올바르게 전달되었는지 검사
NodeBird.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

// 4. 웹 성능 보고 함수:
// 웹 성능 지표를 콘솔에 로깅
export function reportWebVitals(metric) {
  console.log(metric);
}

// 5. NodeBird 컴포넌트를 Redux Wrapper와 함께 내보내기
export default wrapper.withRedux(NodeBird);

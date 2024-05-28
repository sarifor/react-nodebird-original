// # AppLayout 컴포넌트

// 1. 필요 라이브러리, 구성 요소 가져오기
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Menu, Input, Row, Col } from 'antd';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Router from 'next/router';

import UserProfile from './UserProfile';
import LoginForm from './LoginForm';
import useInput from '../hooks/useInput';

// 2. 검색창 스타일링:
// 수직으로 중앙 정렬
const SearchInput = styled(Input.Search)`
  vertical-align: middle;
`;

// 3. AppLayout 컴포넌트
const AppLayout = ({ children }) => {
  
  // 3.1 검색창 상태, 검색창 입력값 변경 시 호출되는 함수 가져오기
  const [searchInput, onChangeSearchInput] = useInput('');

  // 3.2 로그인한 사용자 정보 가져오기
  const { me } = useSelector((state) => state.user);
  
  // 3.3 검색 버튼 클릭 시 호출되는 함수
  const onSearch = useCallback(() => {
    Router.push(`/hashtag/${searchInput}`);
  }, [searchInput]);

  // 3.4 클라이언트 사이드 렌더링
  return (
    <div>
      <Menu mode="horizontal">
        <Menu.Item>
          <Link href="/"><a>노드버드</a></Link>
        </Menu.Item>
        <Menu.Item>
          <Link href="/profile"><a>프로필</a></Link>
        </Menu.Item>
        <Menu.Item>
          <SearchInput
            enterButton
            value={searchInput}
            onChange={onChangeSearchInput}
            onSearch={onSearch}
          />
        </Menu.Item>
      </Menu>
      <Row gutter={8}>
        <Col xs={24} md={6}>
          {me ? <UserProfile /> : <LoginForm />}
        </Col>
        <Col xs={24} md={12}>
          {children}
        </Col>
        <Col xs={24} md={6}>
          <a href="https://www.zerocho.com" target="_blank" rel="noreferrer noopener">Made by ZeroCho</a>
        </Col>
      </Row>
    </div>
  );
};

// 4. AppLayout 컴포넌트에 반드시 자식 요소를 전달해야 함을 명시
AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppLayout;

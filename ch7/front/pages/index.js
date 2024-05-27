// # Home 컴포넌트 서버 사이드 렌더링

// 1. 컴포넌트와 주요 훅
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { END } from 'redux-saga';
import axios from 'axios';

import AppLayout from '../components/AppLayout';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';

// 2. Home 컴포넌트
const Home = () => {
  const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);

  // 2.1 리트윗 에러 핸들링 이펙트: 리트윗 에러 발생 시 사용자에게 알림
  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  // 2.2 스크롤 이벤트 핸들링 이펙트: 스크롤 시 추가 포스트 로딩
  useEffect(() => {
    function onScroll() {
      if (window.pageYOffset + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
        if (hasMorePosts && !loadPostsLoading) {
          const lastId = mainPosts[mainPosts.length - 1]?.id;
          dispatch({
            type: LOAD_POSTS_REQUEST,
            lastId,
          });
        }
      }
    }
    window.addEventListener('scroll', onScroll);

    // 2.3 사용자 인터페이스 구성
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasMorePosts, loadPostsLoading, mainPosts]);
  return (
    <AppLayout>
      {me && <PostForm />}
      {mainPosts.map((post) => <PostCard key={post.id} post={post} />)}
    </AppLayout>
  );
};

// 3. 서버 사이드 렌더링: 서버 사이드에서 초기 데이터 로딩
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  // 3.1 쿠키 설정
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  // 3.2 사용자 정보 로딩
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });

  // 3.3 포스트 로딩
  context.store.dispatch({
    type: LOAD_POSTS_REQUEST,
  });
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
});

export default Home;

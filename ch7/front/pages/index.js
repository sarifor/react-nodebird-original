// # Home 페이지

// 1. 필요 라이브러리, 컴포넌트, 훅, 액션/상태 가져오기
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
  // 2.1 Redux dispatch 함수 가져오기
  const dispatch = useDispatch();
  
  // 2.2 사용자 정보 가져오기
  const { me } = useSelector((state) => state.user);

  // 2.3 포스트 정보 가져오기:
  // 게시물 목록, 더 불러올 게시물 여부, 게시물 로딩 상태, 리트윗 에러 여부
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);

  // 2.4 리트윗 에러 처리: 
  // 리트윗 에러 발생 시 사용자에게 알림
  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  // 2.5 스크롤 이벤트 처리: 
  // 스크롤 시 추가 포스트 로딩
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
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasMorePosts, loadPostsLoading, mainPosts]);

  // 2.6 클라이언트 측 UI 렌더링
  return (
    <AppLayout>
      {me && <PostForm />}
      {mainPosts.map((post) => <PostCard key={post.id} post={post} />)}
    </AppLayout>
  );
};

// 3. 서버 사이드 렌더링:
// 서버에서 초기 데이터 로드
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  // 3.1 쿠키 설정 초기화, 값 할당
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  // 3.2 로그인한 사용자 정보 로딩
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });

  // 3.3 포스트 로딩
  context.store.dispatch({
    type: LOAD_POSTS_REQUEST,
  });

  // 3.4 Saga 종료
  context.store.dispatch(END);

  // 3.5 Saga 비동기 작업 완료 대기
  await context.store.sagaTask.toPromise();
});

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../../context/appContext';
const tablet = 768;
const subRoutes = {
  teamList: [
    { path: '/teams/author', name: '작가 목록' },
    { path: '/teams/list', name: '팀 목록' },
    { path: '/teams/idea', name: '아이디어 게시판' },
  ],
  // 데이터에서 년도를 가져올 예정(api연동-----)
  projectList: [{ path: '/projects/2021', name: '2021' }],
};

const SubNavigation = ({ type }) => {
  const { teamList, projectList } = subRoutes;
  const { curSize } = useAppState();

  const subLink = type === 'teams' ? teamList : projectList;

  return (
    <>
      {subLink.map(({ path, name, id }, i) => {
        return (
          <li key={i}>
            <Link to={path} className="header-route" id={id}>
              {name}
            </Link>
            {curSize > tablet && <span></span>}
          </li>
        );
      })}
    </>
  );
};

export default SubNavigation;

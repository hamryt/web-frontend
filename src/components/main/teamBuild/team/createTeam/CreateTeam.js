import React, { useState, useEffect, useRef } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import './CreateTeam.scss';
import { Editor } from '@toast-ui/react-editor';
import { ToastContainer, toast } from 'react-toastify';
import MemberRoleSquare from '../teamList/MemberRole';
import { useAppState } from '../../../../../context/appContext';
import { createTeam } from '../../../../../service/api/teams';
import { uploadImage } from '../../../../../service/api/upload';
import useTitle from '../../../../../hooks/useTitle';

const toolbarItems = [
  'heading',
  'bold',
  'italic',
  'strike',
  'divider',
  'hr',
  'quote',
  'divider',
  'ul',
  'ol',
  'task',
  'indent',
  'outdent',
  'divider',
  'table',
  'image',
  'link',
  'divider',
  'code',
  'codeblock',
];

const CreateTeam = ({ history, match }) => {
  useTitle(':팀 - 등록하기');
  const { userInfo } = useAppState();

  const editorRef = useRef();
  const [teamName, setTeamName] = useState(null);
  const [category, setCategory] = useState(null);
  const [file, setFile] = useState(null);
  const [designers, setDesigners] = useState(null);
  const [developers, setDevelopers] = useState(null);
  const [mediaArts, setMediaArts] = useState(null);
  const [planners, setPlanners] = useState(null);

  const handleSubmit = () => {
    if (!teamName) {
      toast.error('⛔ 팀명을 적어주세요.');
      return;
    }
    if (!category || category === 'NONE') {
      toast.error('⛔ 카테고리를 정해주세요.');
      return;
    }
    const request = {
      teamName: teamName,
      content: editorRef.current.getInstance().getHtml(),
      projectCategory: category,
    };
    if (file) {
      request['file'] = file;
    }
    if (designers) {
      request['designerMember'] = designers;
    }
    if (developers) {
      request['developerMember'] = developers;
    }
    if (mediaArts) {
      request['mediaArtMember'] = mediaArts;
    }
    if (planners) {
      request['plannerMember'] = planners;
    }
    createTeam(request)
      .then((response) => {
        history.push(`/team-building/teams/${response.id}`);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    if (!file) {
      document.getElementById('file__name').innerHTML = '파일을 선택해주세요.';
      return;
    }
    document.getElementById('file__name').innerHTML = file.name;
  };

  const handleFileDelete = () => {
    setFile(null);
    document.getElementById('file__name').innerHTML = '파일을 선택해주세요.';
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {!userInfo.classOf ? (
        <div>Loading...</div>
      ) : (
        <div className="team__wrap">
          <div className="team__top">
            <div className="team__type">
              <h2>글쓰기</h2>
            </div>
            <div className="board__category">
              <h3>게시판</h3>
              <input type="text" defaultValue={'팀 목록'} readOnly={true} />
            </div>
            <div className="team__category">
              <h3>카테고리</h3>
              <select
                name="selectCategory"
                id="selectCategory"
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="NONE">선택안함</option>
                <option value="WEB_APP">웹/앱</option>
                <option value="MEDIA_ART">미디어아트</option>
                <option value="ANIMATION_FILM">영상/애니메이션</option>
                <option value="GAME">게임</option>
              </select>
            </div>
            <div className="team__title">
              <h3>팀명</h3>
              <input
                type="text"
                placeholder="팀명을 입력하세요"
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
          </div>
          <div className="team__body">
            <div className="team__body__editor">
              <Editor
                toolbarItems={toolbarItems}
                previewStyle="vertical"
                width="1194px"
                height="600px"
                initialEditType="wysiwyg"
                placeholder="글을 작성해주세요"
                ref={editorRef}
                usageStatistics={false}
                hooks={{
                  addImageBlobHook: (blob, callback) => {
                    uploadImage(userInfo.classOf, blob).then((response) => {
                      callback(response.url, 'alt text');
                    });
                    return false;
                  },
                }}
              />
            </div>
          </div>
          <div className="team__bottom">
            <div className="team__members">
              <h3>팀 구성원</h3>
              <div className="team__member">
                <MemberRoleSquare role="DESIGNER" text="DESIGNER" />
                <input
                  type="text"
                  onChange={(e) => setDesigners(e.target.value)}
                  placeholder="이름(학번) 형식으로 입력해주세요. ex)홍길동(20151234)"
                />
              </div>
              <div className="team__member">
                <MemberRoleSquare role="DEVELOPER" text="DEVELOPER" />

                <input
                  type="text"
                  onChange={(e) => setDevelopers(e.target.value)}
                  placeholder="이름(학번) 형식으로 입력해주세요. ex)홍길동(20151234)"
                />
              </div>
              <div className="team__member">
                <MemberRoleSquare role="MEDIA_ART" text="MEDIA_ART" />
                <input
                  type="text"
                  onChange={(e) => setMediaArts(e.target.value)}
                  placeholder="이름(학번) 형식으로 입력해주세요. ex)홍길동(20151234)"
                />
              </div>
              <div className="team__member">
                <MemberRoleSquare role="PLANNER" text="PLANNER" />
                <input
                  type="text"
                  onChange={(e) => setPlanners(e.target.value)}
                  placeholder="이름(학번) 형식으로 입력해주세요. ex)홍길동(20151234)"
                />
              </div>
              <div className="team__file">
                <label className="team__file__label" htmlFor="input-file">
                  <div className="team__file__label__left">
                    <div className="file__image"></div>
                    <p id="file__name">파일을 선택해주세요.</p>
                  </div>
                  <button
                    className="delete__button"
                    onClick={handleFileDelete}
                  ></button>
                </label>
                <input
                  type="file"
                  name="photo"
                  id="input-file"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
          <div className="create__button">
            <button onClick={handleSubmit}>등록</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTeam;

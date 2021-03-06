import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useAppDispatch, useAppState } from '../../../../../context/appContext';
import {
  createAuthorProfile,
  getAuthorProfileDetail,
  updateAuthorProfile,
} from '../../../../../service/api/profile';
import AuthorButton from '../../../common/ButtonWIthIcon';
import './editAuthorStyle.scss';
import EditDeleteButton from '../../../common/EditDeleteButton';
import PortfolioModal from './PortfolioModal';
import RoleModal from './RoleModal';
import { useTeamsDispatch } from '../../../../../context/teamContext';
import useAsync from '../../../../../hooks/useAsync';
import useTitle from '../../../../../hooks/useTitle';

const CreateAuthor = ({ history, match }) => {
  useTitle(
    `:작가 - ${match.params['state'] === 'create' ? '등록하기' : '수정하기'}`,
  );
  const setImgEl = useRef();
  const {
    userState,
    userInfo: { classOf, isLogin },
  } = useAppState();
  const { setJobColor, translationKR } = useAppDispatch();
  if (!isLogin) history.push('/team-building');

  const { setDefaultImg } = useTeamsDispatch();

  const [createAuthorQuery, setCreateAuthorQuery] = useState({
    introduce: null,
    mainRole: null,
    subRole: null,
  });

  const authorId = match.params.id;
  const [profileDetail] = useAsync(
    () => getAuthorProfileDetail(authorId),
    [authorId],
  );

  const type = match.params.state;

  // set Image
  const [file, setFile] = useState(null);
  const [customCN, setCustomCN] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const previewImg = () => {
    const roleBackground = document.querySelector('.img');
    if (!roleBackground) return false;

    if (file) {
      setCustomCN('exist-img');
      if (file.url) {
        return (roleBackground.style.backgroundImage = `url(${file.url})`);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          return (roleBackground.style.backgroundImage = `url(${reader.result})`);
        };
        return reader.readAsDataURL(file);
      }
    } else {
      setCustomCN('');
      return (roleBackground.style.backgroundImage = 'none');
    }
  };

  //set role
  const [modalShow, setModalShow] = useState(false);
  const { mainRole, subRole } = createAuthorQuery;

  const handleRoleChoice = (e) => {
    const { value, name } = e.target;
    let isDuplicate = false;

    if (name === 'mainProjectRole' && value === subRole) isDuplicate = true;

    if (name === 'subProjectRole' && value === mainRole) isDuplicate = true;

    if (isDuplicate) {
      toast.error('⛔ 대표직군과 부가직군은 중복하여 설정이 불가능합니다.');
      e.target.checked = false;
      setCreateAuthorQuery({
        ...createAuthorQuery,
        [name === 'mainProjectRole' ? 'mainRole' : 'subRole']: '',
      });
      return;
    }

    setCreateAuthorQuery({
      ...createAuthorQuery,
      [name === 'mainProjectRole' ? 'mainRole' : 'subRole']:
        value === '선택안함' ? null : value,
    });
  };

  const handleRoleSubmit = () => {
    if (mainRole === '' || subRole === '') {
      toast.error('⛔ 선택하지않은 직군이 있습니다.');
      return;
    }
    setModalShow(false);
  };

  useEffect(() => {
    if (classOf !== '' && userState.data) {
      const { mainProjectRole, subProjectRole } = userState.data.user;
      setCreateAuthorQuery({
        ...createAuthorQuery,
        mainRole: mainProjectRole,
        subRole: subProjectRole,
      });
    }

    if (type === 'edit' && profileDetail.data) {
      setCreateAuthorQuery({
        ...createAuthorQuery,
        introduce: profileDetail.data.content,
        mainRole: profileDetail.data.user.mainProjectRole,
        subRole: profileDetail.data.user.subProjectRole,
      });

      if (profileDetail.data.content) {
        setTextLen(profileDetail.data.content.length);
      }
      if (profileDetail.data.mediaInfo) {
        setFile(profileDetail.data.mediaInfo);
      }
    }
  }, [type, profileDetail, userState]);

  // set introduce
  const [textLen, setTextLen] = useState(0);
  const [txtOver, setTxtOver] = useState('');
  const [textSave, setTextSave] = useState(true);
  const [txt, setTxt] = useState('');

  const handleIntroduce = (e) => {
    if (textLen <= 1000) setTextSave(true);
  };

  const handleTextArea = (e) => {
    setCreateAuthorQuery({
      ...createAuthorQuery,
      introduce: e.target.value,
    });
    setTextLen(e.target.value.length);
    setTxt('저장되었습니다.');
    setTextSave(false);
  };

  useEffect(() => {
    textLen >= 1000 ? setTxtOver('over') : setTxtOver('');

    if (setImgEl.current) {
      Array.from(setImgEl.current.children).map(
        (el) => (el.style.height = `${el.clientWidth}px`),
      );
    }
  });

  // set portfolio
  const [portfolioShow, setPortfolioShow] = useState(false);
  const [portfolioEdit, setPortfolioEdit] = useState(false);
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [checkURL, setCheckURL] = useState(true);
  const [portfolio, setPortfolio] = useState({
    title: '',
    link: '',
    id: 0,
  });

  const showPortfolioModal = (type, data) => {
    switch (type) {
      case 'create':
        if (portfolioLinks.length >= 5) {
          toast.warn('⚠ 포트폴리오는 최대 5개까지 등록 가능합니다.');
          return false;
        }
        setPortfolio({
          title: '',
          link: '',
          id: portfolio.id + 1,
        });

        setPortfolioShow(true);
        setPortfolioEdit(false);

        return;
      case 'edit':
        setPortfolioShow(true);
        setPortfolioEdit(true);
        setPortfolio({
          ...data,
        });

        return;

      default:
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'link') {
      const expUrl = /^http[s]?\:\/\//i;
      if (e.target.value === '') setCheckURL(true);

      expUrl.test(e.target.value) ? setCheckURL(true) : setCheckURL(false);
    }
    setPortfolio({
      ...portfolio,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (!profileDetail.data) return false;

    const { portfolioLinks } = profileDetail.data;

    if (type === 'edit') {
      if (!profileDetail.data) {
        return history.push(`/author/${classOf}`);
      }
      if (profileDetail.data.portfolioLinks) {
        setPortfolioLinks(
          portfolioLinks.map((link, i) => {
            return {
              ...link,
              id: i,
            };
          }),
        );
        setPortfolio({
          ...portfolio,
          id: portfolioLinks.length - 1,
        });
      }
    }
  }, [profileDetail.data]);

  const portfolioToggle = () => {
    if (portfolio.title === '' || portfolio.link === '') {
      toast.error(`⛔ 제목, 링크를 입력해 주세요.`);
      return false;
    }

    if (!portfolioEdit) {
      setPortfolioLinks(portfolioLinks.concat(portfolio));
    } else {
      if (portfolioEdit) {
        setPortfolioLinks(
          portfolioLinks.map((link) => {
            if (link.id === portfolio.id) {
              return {
                ...portfolio,
                title: portfolio.title,
                link: portfolio.link,
              };
            }
            return link;
          }),
        );
      }
    }

    checkURL ? setPortfolioShow(false) : setPortfolioShow(true);
  };

  const handleDelete = (id, title) => {
    setPortfolioLinks(
      portfolioLinks.filter((portfolio) => portfolio.id !== id),
    );
    toast.success(`${title}이 삭제 되었습니다.`);
  };

  const handleSubmitAuthor = () => {
    if (createAuthorQuery.mainRole === null) {
      toast.error('⛔대표직군은 반드시 설정해 주세요.');
      return false;
    }

    if (!textSave) {
      toast.warn('자기소개글 설정을 확인해 주세요');
      return false;
    }

    const formdata = new FormData();
    if (file) {
      if (file.modifyName) {
        formdata.delete('image');
      } else {
        formdata.append('image', file);
      }
    }

    // portfolio
    if (portfolioLinks) {
      portfolioLinks.map((data, i) => {
        formdata.append(`portfolioLinks[${i}].link`, portfolioLinks[i].link);
        formdata.append(`portfolioLinks[${i}].title`, portfolioLinks[i].title);
      });
    }

    // mainrole,subrole,introduce
    for (let name in createAuthorQuery) {
      formdata.append(name, createAuthorQuery[name]);
      if (createAuthorQuery[name] === null) {
        formdata.delete(name);
      }
    }

    switch (type) {
      case 'create':
        createAuthorProfile({ classOf, history }, formdata);
        return;

      case 'edit':
        if (profileDetail.data.mediaInfo && !file.modifyName) {
          formdata.append(
            'deleteFileName',
            profileDetail.data.mediaInfo.modifyName,
          );
        }

        updateAuthorProfile({ classOf, history }, formdata);
        return;

      default:
    }
  };

  const roleStyle = (role) => {
    if (role === '선택안함') return;
    return {
      color: 'white',
      backgroundColor: setJobColor(role),
      border: 'none',
    };
  };

  const setDefaultImage = () => {
    setFile(null);
    toast.success(`✅ 기본 이미지로 설정 하였습니다.`);
  };

  useEffect(() => {
    previewImg();
  }, [file, portfolioShow]);

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ color: '#ffffff', fontWeight: 'bold' }}
      />
      {modalShow && (
        <RoleModal
          roleChoice={handleRoleChoice}
          roleSubmit={handleRoleSubmit}
          roleModalShow={modalShow}
          roleSetModalShow={setModalShow}
          mainRole={mainRole}
          subRole={subRole}
        />
      )}
      <>
        {portfolioShow ? (
          <PortfolioModal
            pfSubmit={portfolioToggle}
            pfChange={handleChange}
            pfModalShow={portfolioShow}
            pfSetModalShow={setPortfolioShow}
            data={portfolio}
            checkURL={checkURL}
          />
        ) : (
          <div className="edit-author-wrap page-box">
            {/* 사진설정 */}
            <section className="edit-section">
              <h3 className="edit-author-title">
                <i className="title-icon" />
                사진 설정
              </h3>
              <p className="edit-author-description">
                자신을 나타낼 수 있는 사진들을 등록해보세요.
              </p>
              <div className="section-contents set-img" ref={setImgEl}>
                <div className={`custom-img ${customCN}`}>
                  <div className="img" />
                  <div className="set-img-icon">
                    <i className="icon" />
                    <span>사진 가져오기</span>
                  </div>
                  <label className="file-button" htmlFor="input-file" />
                  <input
                    type="file"
                    id="input-file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="default-img" onClick={setDefaultImage}>
                  <div
                    className="img"
                    style={{
                      backgroundImage: `url(${setDefaultImg(
                        createAuthorQuery.mainRole,
                      )})`,
                    }}
                  />
                  <div className="set-img-icon">
                    <i className="icon" />
                    <span>기본 이미지로 설정</span>
                  </div>
                </div>
              </div>
            </section>
            {/* 직군 설정 */}
            <section className="edit-section">
              <h3 className="edit-author-title">
                <i className="title-icon" />
                직군 설정
                <button
                  className="set-role-icon"
                  onClick={() => setModalShow(true)}
                />
              </h3>
              <p className="edit-author-description">
                자신의 직군을 설정하세요.(대표 1개, 부가직군 1개까지 설정 가능)
              </p>
              <div className="section-contents set-role">
                <ul>
                  <li>
                    <strong style={{ ...roleStyle(mainRole) }}>
                      {translationKR(mainRole)}
                    </strong>
                    <span>대표직군</span>
                  </li>
                  <li>
                    <strong style={{ ...roleStyle(subRole) }}>
                      {subRole !== '선택안함'
                        ? translationKR(subRole)
                        : '선택하세요'}
                    </strong>
                    <span>부가직군</span>
                  </li>
                </ul>
              </div>
            </section>
            {/* 자기소개글 설정 */}
            <section className="edit-section">
              <h3 className="edit-author-title">
                <i className="title-icon" />
                자기소개글 설정
              </h3>
              <p className="edit-author-description">
                자기소개글을 작성하세요.(공백 포함 1000자 이내)
              </p>
              <div className="section-contents set-introduce">
                <textarea
                  name="introduce"
                  maxLength={1000}
                  onInput={handleTextArea}
                  defaultValue={createAuthorQuery.introduce}
                ></textarea>
                <span
                  className={`txt-length ${txtOver}`}
                >{`${textLen}/1000`}</span>
                <div className="introduce-btn ">
                  {textSave && <span>{txt}</span>}
                  <AuthorButton
                    btntype="edit"
                    btnTxt="수정완료"
                    handleButton={handleIntroduce}
                  />
                </div>
              </div>
            </section>
            {/* 포트폴리오 설정 */}
            <section className="edit-section">
              <h3 className="edit-author-title">
                <i className="title-icon" />
                포트폴리오 설정
              </h3>
              <p className="edit-author-description">
                본인의 포트폴리오를 설정하세요.(최대 5개)
              </p>
              <div className="section-contents set-portfolio">
                <ul>
                  {portfolioLinks &&
                    portfolioLinks.map((data, i) => {
                      return (
                        <li className="portfolio" key={i}>
                          <i className="porfolio-icon"></i>
                          <div className="portfolio-info">
                            <div className="portfolio-title-box">
                              <strong className="porfolio-title">
                                {data.title}
                              </strong>
                              <div className="edit-delete-box">
                                <EditDeleteButton
                                  form="setPortfolio"
                                  handleEdit={() =>
                                    showPortfolioModal('edit', data)
                                  }
                                  handleDelete={() =>
                                    handleDelete(data.id, data.title)
                                  }
                                />
                              </div>
                            </div>
                            <a
                              href={data.link}
                              className="porfolio-link"
                              target="blank"
                            >
                              {data.link}
                            </a>
                          </div>
                        </li>
                      );
                    })}
                </ul>

                <button
                  className="portfolio-add-btn"
                  onClick={() => showPortfolioModal('create')}
                >
                  <i className="porfolio-add-icon" />
                  등록하기
                </button>
              </div>
            </section>
            <AuthorButton
              btntype="save"
              btnTxt="변경사항 저장"
              handleButton={handleSubmitAuthor}
            />
          </div>
        )}
      </>
    </>
  );
};

export default CreateAuthor;

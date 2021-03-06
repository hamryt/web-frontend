import { client } from './client';

const uploadImage = async (classOf, image) => {
  const formdata = new FormData();
  formdata.append('image', image);


  try {
    const { data } = await client.post(`/upload/${classOf}/image`, formdata, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  } catch (e) {
    console.log(e);
    console.log(e.response);
  }
}

export {
  uploadImage
};
import { Inter } from 'next/font/google'
import {useEffect, useState} from "react";
import {ColumnsType} from "antd/es/table";
import {Button, Form, Input, message, Modal, Select, Space, Table, Tag} from "antd";
import { faker } from '@faker-js/faker';
import {User} from ".prisma/client";
const inter = Inter({ subsets: ['latin'] })

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 12 },
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]); 
  const [courses, setCourses] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalTwoOpen, setIsModalTwoOpen] = useState(false);
  const [form] = Form.useForm();

  const onStudentFinish = async (values: any) => {
    console.log(values);
    setIsModalOpen(false);
    setIsModalTwoOpen(false);
    fetch('/api/create_user', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    }).then(async response => {
      if (response.status === 200) {
        const user = await response.json();
        message.success('Registered student ' + user.name);
        setUsers([...users, user]);

      } else message.error(
          `Failed to register student:\n ${JSON.stringify(await response.json())}`);
    }).catch(res=>{message.error(res)})
  };

  // need to finish
  const onCourseFinish = async (values: any) => {
    console.log(values);
    setIsModalOpen(false);
    setIsModalTwoOpen(false);
    fetch('/api/add_course', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    }).then(async response => {
      if (response.status === 200) {
        const user = await response.json();
        message.success('Added course ' + user.course.name);
        setUsers([...users, user]); // figure out what this does

      } else message.error(
          `Failed to add course:\n ${JSON.stringify(await response.json())}`);
    }).catch(res=>{message.error(res)})
  };

  const onDelete = async (user: any) => {
    const {id} = user;
    setIsModalOpen(false);
    setIsModalTwoOpen(false);
    fetch('/api/delete_user', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id})
    }).then(async response => {
      if (response.status === 200) {
        await response.json();
        message.success('Deleted user ' + user.name);
        setUsers(users.filter(u=> u.id !== id ));

      } else message.error(
          `Failed to delete user:\n ${user.name}`);
    }).catch(res=>{message.error(res)})
  };
  
  // need to finish add_course
  // const onAddcourse = async (user: any) => {
  //   const {id} = user;
  //   setIsModalOpen(false);
  //   setIsModalTwoOpen(true);
  //   fetch('/api/add_course', {
  //     method: 'POST',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({id})
  //   }).then(async response => {
  //     if (response.status === 200) {
  //       await response.json();
  //       message.success('Added course ' + user.course.name);
  //       setUsers(users.filter(u=> u.id !== id ));

  //     } else message.error(
  //         `Failed to add course:\n ${user.course.name}`);
  //   }).catch(res=>{message.error(res)})
  // };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'School',
      dataIndex: 'school',
      key: 'school',
    },
    {
      title: 'Major',
      dataIndex: 'major',
      key: 'major',
    },
  
    { // need to test
      title: 'Action',
      key: 'action',
      render: (_, record) => (
          <Space size="middle">
            <a onClick={()=>onDelete(record)}>Delete Student</a>
            <a onClick={()=>showcourseModal()}>Add course</a>
          </Space>
      ),
    },
  ];

  // Define a separate columns structure for the class table
const courseColumns: ColumnsType<any> = [
  {
    title: 'Student Name',
    dataIndex: 'studentName',
    key: 'studentName',
  },
  {
    title: 'Course Name',
    dataIndex: 'courseName',
    key: 'courseName',
  },
  {
    title: 'Professor',
    dataIndex: 'professor',
    key: 'professor',
  },
  {
    title: 'Class Location',
    dataIndex: 'location',
    key: 'location',
  },
];


  const onReset = () => {
    form.resetFields();
  };

  const onStudentFill = () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const street = faker.location.streetAddress();
    const city = faker.location.city();
    const state  = faker.location.state({ abbreviated: true });
    const zip = faker.location.zipCode()

    form.setFieldsValue({
      name: `${firstName} ${lastName}`,
      email: email,
      address:
          `${street}, ${city}, ${state}, US, ${zip}`
    });
  };

  const oncourseFill = () => {
    const courseNameS = ['Intro to Cloud Computing', 'Computer Architecture',
                        'Intro to Software Engr', 'Database Management Systems'];
    const courseName = faker.helpers.arrayElement(courseNameS);
    const professorS = ['Tiffany Zhang', 'Kwangsung Oh', 'Eric Lundy', 'Praval Sharma'];
    const professor = faker.helpers.arrayElement(professorS);
    const locationS = ['PKI', 'Totally Online'];
    const location = faker.helpers.arrayElement(locationS);

    form.setFieldsValue({
      name: `${courseName}`,
      professor: professor,
      location: location
    });
  };
  const showStudentModal = () => {
    setIsModalOpen(true);
    form.resetFields();
  };
  const showcourseModal = () => {
    setIsModalOpen(true);
    form.resetFields();
  };
  const studentCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };
  const courseCancel = () => {
    setIsModalTwoOpen(false);
    form.resetFields();
  };
  useEffect(()=>{
    fetch('api/all_user', {method: "GET"})
        .then(res => {
          res.json().then(
              (json=> {setUsers(json)})
          )
        })
  }, []);

  if (!users) return "Give me a second";

  return  <>
    <Button type="primary" onClick={showStudentModal}>
      Add User
    </Button>
    <Modal title="Student Registration Form" onCancel={studentCancel}
           open={isModalOpen} footer={null}  width={800}>
      <Form
          {...layout}
          form={form}
          name="control-hooks"
          onFinish={onStudentFinish}
          style={{ maxWidth: 600 }}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="address" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="school" label="school" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="major" label="major" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item {...tailLayout} >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
          <Button  htmlType="button" onClick={onStudentFill}>
            Fill form
          </Button>
          <Button  htmlType="button" onClick={studentCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
    <Modal title="course Registration Form" onCancel={studentCancel}
           open={isModalTwoOpen} footer={null}  width={800}>
      <Form
          {...layout}
          form={form}
          name="control-hooks"
          onFinish={onCourseFinish}
          style={{ maxWidth: 600 }}
      >
        <Form.Item name="courseName" label="course Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="professor" label="Professor" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="location" label="Location" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item {...tailLayout} >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
          <Button  htmlType="button" onClick={oncourseFill}>
            Fill form
          </Button>
          <Button  htmlType="button" onClick={courseCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
    {/*<p>{JSON.stringify(users)}</p>*/}
    <Table columns={columns} dataSource={users} />;
    <Table columns={courseColumns} dataSource={users.map(user => ({
    key: user.id, // Required for React table rendering
    studentName: user.name,
    courseName: user.course?.name, // Spreads the course data (name, professor, location) into the row
    professor: user.course?.professor, // Professor
    location: user.course?.location, // Class Location
  }))} // Use the user's class data here
  pagination={false} // Optional: Disable pagination for the class table
/>
  </>;


}

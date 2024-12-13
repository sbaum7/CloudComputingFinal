import { Inter } from 'next/font/google'
import { useEffect, useState } from "react";
import { ColumnsType } from "antd/es/table";
import { Button, Form, Input, message, Modal, Space, Table } from "antd";
import { faker } from '@faker-js/faker';
import { User } from ".prisma/client";
import { Course } from ".prisma/client";
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalTwoOpen, setIsModalTwoOpen] = useState(false);
  const [studentForm] = Form.useForm();
  const [courseForm] = Form.useForm();
  const [currentStudent, setCurrentStudent] = useState<User | null>(null);

  const onStudentFinish = async (values: any) => {
    console.log(values);
    setIsModalOpen(false);
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
      } else {
        message.error(`Failed to register student:\n ${JSON.stringify(await response.json())}`);
      }
    }).catch(res => { message.error(res) })
  };

  const onCourseFinish = async (values: any) => {
    console.log('Current student:', currentStudent); // Add debug log
    
    if (!currentStudent?.id) {
      message.error('No student selected');
      return;
    }
  
    const courseData = {
      name: values.courseName,
      professor: values.professor,
      location: values.location
    };
  
    console.log('Sending data:', { userId: currentStudent.id, courseData }); // Debug log
  
    fetch('/api/add_course', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: currentStudent.id,
        courseData: courseData
      }),
    })
    .then(async (response) => {
      if (response.status === 200) {
        const course = await response.json();
        message.success('Added course ' + courseData.name);
        setCourses([...courses, course]);
        setIsModalTwoOpen(false);
      } else {
        const error = await response.json();
        message.error(`Failed to add course: ${error.message}`);
      }
    })
    .catch((error) => {
      message.error('Error: ' + error.message);
    });
  };

  const onDelete = async (user: any) => {
    const { id } = user;
    setIsModalOpen(false);
    setIsModalTwoOpen(false);
    fetch('/api/delete_user', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    }).then(async response => {
      if (response.status === 200) {
        await response.json();
        message.success('Deleted user ' + user.name);
        setUsers(users.filter(u => u.id !== id));
      } else {
        message.error(`Failed to delete user:\n ${user.name}`);
      }
    }).catch(res => { message.error(res) })
  };

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
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => onDelete(record)}>Delete Student</a>
          <a onClick={() => {
            console.log('Setting current student:', record); // Debug log
            setCurrentStudent(record);
            showCourseModal();
          }}>Add course</a>
        </Space>
      ),
    },
  ];

  const courseColumns: ColumnsType<any> = [
    {
      title: 'Course Name',
      dataIndex: 'name', // Changed from courseName to name to match API response
      key: 'name',
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

  const onReset = (form: any) => {
    form.resetFields();
  };

  const onStudentFill = () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const street = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state({ abbreviated: true });
    const zip = faker.location.zipCode()

    studentForm.setFieldsValue({
      name: `${firstName} ${lastName}`,
      email: email,
      address: `${street}, ${city}, ${state}, US, ${zip}`
    });
  };

  const onCourseFill = () => {
    const courseNameS = ['Intro to Cloud Computing', 'Computer Architecture',
      'Intro to Software Engr', 'Database Management Systems'];
    const courseName = faker.helpers.arrayElement(courseNameS);
    const professorS = ['Tiffany Zhang', 'Kwangsung Oh', 'Eric Lundy', 'Praval Sharma'];
    const professor = faker.helpers.arrayElement(professorS);
    const locationS = ['PKI', 'Totally Online'];
    const location = faker.helpers.arrayElement(locationS);

    courseForm.setFieldsValue({
      courseId: faker.datatype.uuid(),
      courseName: courseName,
      professor: professor,
      location: location
    });
  };

  const showStudentModal = () => {
    setIsModalOpen(true);
    studentForm.resetFields();
  };

  const showCourseModal = () => {
    setIsModalTwoOpen(true);
    courseForm.resetFields();
  };

  const studentCancel = () => {
    setIsModalOpen(false);
    studentForm.resetFields();
  };

  const courseCancel = () => {
    setIsModalTwoOpen(false);
    courseForm.resetFields();
  };

  useEffect(() => {
    fetch('api/all_user', { method: "GET" })
      .then(res => {
        res.json().then(
          (json => { setUsers(json) })
        )
      }),
      fetch('api/all_course', { method: "GET" })
        .then(res => {
          res.json().then(
            (json => { setCourses(json) })
          )
        })
  }, []);

  if (!users) return "Give me a second";

  return <>
	<div className="button-container">
	<Button type="primary" className="black-button" onClick={showStudentModal}>
      Register Student
	</Button>
    </div>
    <Modal title="Student Registration Form" onCancel={studentCancel}
      open={isModalOpen} footer={null} width={800}>
      <Form
        {...layout}
        form={studentForm}
        name="student-form"
        onFinish={onStudentFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="school" label="School" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="major" label="Major" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item {...tailLayout} >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={() => onReset(studentForm)}>
            Reset
          </Button>
          <Button htmlType="button" onClick={onStudentFill}>
            Fill form
          </Button>
          <Button htmlType="button" onClick={studentCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>

    <Modal title="Course Registration Form" onCancel={courseCancel}
      open={isModalTwoOpen} footer={null} width={800}>
      <Form
        {...layout}
        form={courseForm}
        name="course-form"
        onFinish={onCourseFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item name="courseId" label="Course ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="courseName" label="Course Name" rules={[{ required: true }]}>
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
          <Button htmlType="button" onClick={() => onReset(courseForm)}>
            Reset
          </Button>
          <Button htmlType="button" onClick={onCourseFill}>
            Fill form
          </Button>
          <Button htmlType="button" onClick={courseCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>

    <Table columns={columns} dataSource={users} />
    <Table 
      columns={courseColumns} 
      dataSource={courses.map(course => ({
        key: course.id,
        name: course.name,
        professor: course.professor,
        location: course.location
      }))} 
      pagination={false} 
    />
  </>;
}

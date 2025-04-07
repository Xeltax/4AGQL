import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    Typography,
    Space,
    Tabs,
    Tag,
    Avatar,
    Descriptions,
    Button,
    Dropdown,
    Badge,
    message,
    Spin,
    Menu,
    Tooltip,
    Modal,
    Form,
    Input,
    InputNumber,
    Select
} from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    EditOutlined,
    DownloadOutlined,
    MoreOutlined,
    MessageOutlined,
    ExclamationCircleOutlined,
    FileExcelOutlined,
    EyeOutlined,
    PlusOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import Layout from '../../components/Layout/MainLayout';
import { GetServerSideProps, NextPage } from 'next';

// Import des requêtes GraphQL
import {UPDATE_COURSE, UPDATE_COURSE_STUDENTS, DELETE_COURSE, GET_ALL_COURSES} from '../../graphql/courses';
import { CREATE_GRADE, UPDATE_GRADE, DELETE_GRADE } from '../../graphql/grades';
import {client} from '../../lib/apolloClient';
import { GET_COURSE_BY_ID } from '../../graphql/courses';
import { GET_GRADES_FOR_PROFESSOR } from '../../graphql/grades';
import {GET_ALL_USERS} from '../../graphql/users';
import {parse} from 'cookie';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { Option } = Select;

interface Student {
    id: string;
    pseudo: string;
    email: string;
}

interface Professor {
    id: string;
    pseudo: string;
    email: string;
}

interface Course {
    id: string;
    name: string;
    professor: Professor;
    students: Student[];
}

interface Grade {
    id: string;
    note: number;
    comment: string;
    course: {
        id: string;
        name: string;
    };
    student: {
        id: string;
        pseudo: string;
        email: string;
    };
}

interface CourseDetailProps {
    courseData: {
        data: {
            getCourseById: Course | null;
        }
    };
    gradesData: {
        data: {
            getGradesForProfessor: Grade[] | null;
        }
    };
    error?: string;
}

const CourseDetail: NextPage<CourseDetailProps> = ({ courseData, gradesData, error }) => {
    const router = useRouter();
    const { id } = router.query;

    // États pour les modals
    const [isEditCourseModalVisible, setIsEditCourseModalVisible] = useState(false);
    const [isAddStudentModalVisible, setIsAddStudentModalVisible] = useState(false);
    const [isAddGradeModalVisible, setIsAddGradeModalVisible] = useState(false);
    const [isEditGradeModalVisible, setIsEditGradeModalVisible] = useState(false);
    const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);

    // Forms
    const [editCourseForm] = Form.useForm();
    const [addStudentForm] = Form.useForm();
    const [addGradeForm] = Form.useForm();
    const [editGradeForm] = Form.useForm();

    // Mutations
    const [deleteCourse] = useMutation(DELETE_COURSE);
    const [updateCourseStudents] = useMutation(UPDATE_COURSE_STUDENTS);
    const [updateCourse] = useMutation(UPDATE_COURSE);
    const [createGrade] = useMutation(CREATE_GRADE);
    const [updateGrade] = useMutation(UPDATE_GRADE);
    const [deleteGrade] = useMutation(DELETE_GRADE);

    // Fonctions pour gérer les modals
    const showEditCourseModal = () => {
        if (courseData?.data?.getCourseById) {
            editCourseForm.setFieldsValue({
                name: courseData.data.getCourseById.name
            });
        }
        setIsEditCourseModalVisible(true);
    };

    const handleEditCourseOk = () => {
        editCourseForm.validateFields()
            .then(values => {
                updateCourse({
                    variables: {
                        courseId: id as string,
                        name: values.name
                    }
                })
                    .then(() => {
                        message.success("Cours mis à jour");
                        setIsEditCourseModalVisible(false);
                        router.replace(router.asPath);
                    })
                    .catch(err => {
                        message.error(`Erreur: ${err.message}`);
                    });
            })
            .catch(info => {
                console.log('Validation failed:', info);
            });
    };

    const showAddStudentModal = () => {
        addStudentForm.resetFields();
        setIsAddStudentModalVisible(true);
    };

    const handleAddStudentOk = () => {
        addStudentForm.validateFields()
            .then(values => {
                updateCourseStudents({
                    variables: {
                        courseId: id as string,
                        studentId: values.studentId,
                        action: "ADD"
                    }
                })
                    .then(() => {
                        message.success("Étudiant ajouté au cours");
                        setIsAddStudentModalVisible(false);
                        router.replace(router.asPath);
                    })
                    .catch(err => {
                        message.error(`Erreur: ${err.message}`);
                    });
            })
            .catch(info => {
                console.log('Validation failed:', info);
            });
    };

    const showAddGradeModal = () => {
        addGradeForm.resetFields();
        setIsAddGradeModalVisible(true);
    };

    const handleAddGradeOk = () => {
        addGradeForm.validateFields()
            .then(values => {
                createGrade({
                    variables: {
                        userId: values.studentId,
                        courseId: id as string,
                        note: values.note,
                        comment: values.comment || ""
                    }
                })
                    .then(() => {
                        message.success("Note ajoutée");
                        setIsAddGradeModalVisible(false);
                        router.replace(router.asPath);
                    })
                    .catch(err => {
                        message.error(`Erreur: ${err.message}`);
                    });
            })
            .catch(info => {
                console.log('Validation failed:', info);
            });
    };

    const showEditGradeModal = (grade: Grade) => {
        setCurrentGrade(grade);
        editGradeForm.setFieldsValue({
            note: grade.note,
            comment: grade.comment
        });
        setIsEditGradeModalVisible(true);
    };

    const handleEditGradeOk = () => {
        if (!currentGrade) return;

        editGradeForm.validateFields()
            .then(values => {
                updateGrade({
                    variables: {
                        gradeId: currentGrade.id,
                        note: values.note,
                        comment: values.comment
                    }
                })
                    .then(() => {
                        message.success("Note mise à jour");
                        setIsEditGradeModalVisible(false);
                        router.replace(router.asPath);
                    })
                    .catch(err => {
                        message.error(`Erreur: ${err.message}`);
                    });
            })
            .catch(info => {
                console.log('Validation failed:', info);
            });
    };

    // Fonction pour afficher la confirmation de suppression de cours
    const showDeleteCourseConfirm = () => {
        confirm({
            title: 'Êtes-vous sûr de vouloir supprimer ce cours?',
            icon: <ExclamationCircleOutlined />,
            content: 'Cette action est irréversible.',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            onOk() {
                deleteCourse({ variables: { id } })
                    .then(() => {
                        message.success('Cours supprimé avec succès');
                        router.push('/courses');
                    })
                    .catch(err => {
                        message.error(`Erreur lors de la suppression: ${err.message}`);
                    });
            }
        });
    };

    // Fonction pour afficher la confirmation de suppression de note
    const showDeleteGradeConfirm = (gradeId: string) => {
        confirm({
            title: 'Êtes-vous sûr de vouloir supprimer cette note?',
            icon: <ExclamationCircleOutlined />,
            content: 'Cette action est irréversible.',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            onOk() {
                deleteGrade({ variables: { gradeId } })
                    .then(() => {
                        message.success("Note supprimée");
                        router.replace(router.asPath);
                    })
                    .catch(err => {
                        message.error(`Erreur: ${err.message}`);
                    });
            }
        });
    };

    // Colonnes pour le tableau des étudiants
    const studentColumns = [
        {
            title: 'Étudiant',
            dataIndex: 'pseudo',
            key: 'pseudo',
            render: (text: string, record: any) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <div>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: string, record: any) => (
                <Space size="small">
                    <Tooltip title="Voir le profil">
                        <Button icon={<EyeOutlined />} size="small" type="primary" onClick={() => router.push(`/students/${record.id}`)} />
                    </Tooltip>
                    <Tooltip title="Retirer du cours">
                        <Button
                            danger
                            size="small"
                            onClick={() => {
                                confirm({
                                    title: `Êtes-vous sûr de vouloir retirer ${record.pseudo} du cours?`,
                                    icon: <ExclamationCircleOutlined />,
                                    okText: 'Oui',
                                    okType: 'danger',
                                    cancelText: 'Non',
                                    onOk() {
                                        updateCourseStudents({
                                            variables: {
                                                courseId: id as string,
                                                studentId: record.id,
                                                action: "REMOVE"
                                            }
                                        })
                                            .then(() => {
                                                message.success(`${record.pseudo} a été retiré du cours`);
                                                router.replace(router.asPath);
                                            })
                                            .catch(err => {
                                                message.error(`Erreur: ${err.message}`);
                                            });
                                    }
                                });
                            }}
                        >
                            Retirer
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Colonnes pour le tableau des notes
    const gradesColumns = [
        {
            title: 'Étudiant',
            dataIndex: ['student', 'pseudo'],
            key: 'student',
            render: (text: string, record: any) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <div>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.student.email}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            render: (note: number) => (
                <span style={{
                    color: note >= 16 ? '#52c41a' : note >= 12 ? '#1890ff' : '#f5222d',
                    fontWeight: 'bold'
                }}>
                    {note.toFixed(1)}/20
                </span>
            ),
        },
        {
            title: 'Commentaire',
            dataIndex: 'comment',
            key: 'comment',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: string, record: any) => (
                <Space size="small">
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => showEditGradeModal(record)}
                    >
                        Modifier
                    </Button>
                    <Button
                        danger
                        size="small"
                        onClick={() => showDeleteGradeConfirm(record.id)}
                    >
                        Supprimer
                    </Button>
                </Space>
            ),
        },
    ];

    // Si erreur
    if (error) {
        return (
            <Layout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <Title level={3}>Erreur:</Title>
                    <Text type="danger">{error}</Text>
                </div>
            </Layout>
        );
    }

    // Si pas de données
    if (!courseData || !courseData.data.getCourseById) {
        return (
            <Layout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <Title level={3}>Cours non trouvé</Title>
                </div>
            </Layout>
        );
    }

    const course = courseData.data.getCourseById;
    const grades = gradesData?.data.getGradesForProfessor || [];

    console.log("Course Data:", course);
    console.log("Grades Data:", grades);

    return (
        <Layout>
            <div className="course-detail">
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Space direction="vertical" size={4}>
                            <Space align="center">
                                <Title level={2} style={{ marginBottom: 0 }}>{course.name}</Title>
                                <Tag color="blue">{course.id}</Tag>
                            </Space>
                            <Text type="secondary">Détails du cours et suivi des activités</Text>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<EditOutlined />} onClick={showEditCourseModal}>
                                Modifier
                            </Button>
                            <Button danger onClick={showDeleteCourseConfirm}>
                                Supprimer le cours
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                        <Card>
                            <Descriptions
                                title="Informations du cours"
                                bordered
                                layout="vertical"
                                column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                            >
                                <Descriptions.Item label="Professeur">
                                    <Space>
                                        <Avatar icon={<UserOutlined />} />
                                        <div>
                                            <div>{course.professor.pseudo}</div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>{course.professor.email}</Text>
                                        </div>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="ID du cours">
                                    {course.id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Nombre d'étudiants">
                                    {course.students.length}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={24}>
                                <Card className="dashboard-card">
                                    <Statistic
                                        title="Étudiants inscrits"
                                        value={course.students.length}
                                        prefix={<TeamOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} md={24}>
                                <Card className="dashboard-card">
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={showAddStudentModal}
                                    >
                                        Ajouter un étudiant
                                    </Button>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Card style={{ marginTop: 16 }}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Étudiants" key="1" style={{ padding: '8px 0' }}>
                            <Table
                                dataSource={course.students}
                                columns={studentColumns}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                            />
                        </TabPane>

                        <TabPane tab="Notes" key="2" style={{ padding: '8px 0' }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                style={{ marginBottom: 16 }}
                                onClick={showAddGradeModal}
                            >
                                Ajouter une note
                            </Button>
                            {grades.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <Text>Aucune note disponible pour ce cours</Text>
                                </div>
                            ) : (
                                <Table
                                    dataSource={grades}
                                    columns={gradesColumns}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                />
                            )}
                        </TabPane>
                    </Tabs>
                </Card>
            </div>

            {/* Modal pour modifier le cours */}
            <Modal
                title="Modifier le cours"
                visible={isEditCourseModalVisible}
                onOk={handleEditCourseOk}
                onCancel={() => setIsEditCourseModalVisible(false)}
            >
                <Form form={editCourseForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Nom du cours"
                        rules={[{ required: true, message: 'Veuillez saisir le nom du cours' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal pour ajouter un étudiant */}
            <Modal
                title="Ajouter un étudiant"
                visible={isAddStudentModalVisible}
                onOk={handleAddStudentOk}
                onCancel={() => setIsAddStudentModalVisible(false)}
            >
                <Form form={addStudentForm} layout="vertical">
                    <Form.Item
                        name="studentId"
                        label="ID de l'étudiant"
                        rules={[{ required: true, message: "Veuillez saisir l'ID de l'étudiant" }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal pour ajouter une note */}
            <Modal
                title="Ajouter une note"
                visible={isAddGradeModalVisible}
                onOk={handleAddGradeOk}
                onCancel={() => setIsAddGradeModalVisible(false)}
            >
                <Form form={addGradeForm} layout="vertical">
                    <Form.Item
                        name="studentId"
                        label="ID de l'étudiant"
                        rules={[{ required: true, message: "Veuillez saisir l'ID de l'étudiant" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="note"
                        label="Note (sur 20)"
                        rules={[
                            { required: true, message: 'Veuillez saisir une note' },
                            { type: 'number', min: 0, max: 20, message: 'La note doit être entre 0 et 20' }
                        ]}
                    >
                        <InputNumber min={0} max={20} step={0.5} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="comment"
                        label="Commentaire"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal pour modifier une note */}
            <Modal
                title="Modifier la note"
                visible={isEditGradeModalVisible}
                onOk={handleEditGradeOk}
                onCancel={() => setIsEditGradeModalVisible(false)}
            >
                <Form form={editGradeForm} layout="vertical">
                    <Form.Item
                        name="note"
                        label="Note (sur 20)"
                        rules={[
                            { required: true, message: 'Veuillez saisir une note' },
                            { type: 'number', min: 0, max: 20, message: 'La note doit être entre 0 et 20' }
                        ]}
                    >
                        <InputNumber min={0} max={20} step={0.5} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="comment"
                        label="Commentaire"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

// Récupérer les données côté serveur avec getServerSideProps
export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.query;

    try {
        const cookies = context.req.headers.cookie || "";
        const parsedCookies = parse(cookies);
        // Récupérer le token d'authentification depuis les cookies
        const token = parsedCookies.JWT || '';

        // Configuration des headers d'authentification
        const headers = token ? { authorization: `Bearer ${token}` } : {};

        // Vérifier l'authentification
        if (!token) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            };
        }

        const [courseData, gradesData] = await Promise.all([
            client.query({
                query: GET_COURSE_BY_ID,
                context: { headers },
                variables: { id },
            }),
            client.query({
                query: GET_GRADES_FOR_PROFESSOR,
                context: { headers },
                variables: { courseIds: [id as string] },
            })
        ]);

        console.log("Course Data:", courseData);
        console.log("gradesData Data:", gradesData);

        return {
            props: {
                courseData,
                gradesData,
            },
        };
    } catch (error) {
        return {
            props: {
                error: `Une erreur s'est produite lors de la récupération des données: ${error instanceof Error ? error.message : String(error)}`,
                courseData: null,
                gradesData: null,
            },
        };
    }
};

export default CourseDetail;
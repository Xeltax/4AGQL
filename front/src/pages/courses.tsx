import React, { useState } from 'react';
import {
    Row,
    Col,
    Card,
    Table,
    Tag,
    Space,
    Input,
    Button,
    Typography,
    Select,
    Badge,
    Tooltip,
    Statistic,
    Modal,
    Form,
    message
} from 'antd';
import {
    BookOutlined,
    SearchOutlined,
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    TeamOutlined,
    ScheduleOutlined,
    FileDoneOutlined
} from '@ant-design/icons';
import Layout from '../components/Layout/MainLayout';
import type { NextPage, GetServerSideProps } from 'next';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import { parse } from 'cookie';
import { client } from '../lib/apolloClient';
import {
    GET_ALL_COURSES,
    CREATE_COURSE,
    UPDATE_COURSE,
    DELETE_COURSE
} from '../graphql/courses';
import { GET_ALL_USERS } from '../graphql/users';

const { Title, Text } = Typography;
const { Option } = Select;

interface Course {
    id: string;
    name: string;
    professor: {
        id: string;
        email: string;
        pseudo: string;
    };
    students: Array<{
        id: string;
        email: string;
        pseudo: string;
    }>;
}

interface User {
    id: string;
    email: string;
    pseudo: string;
    role: string;
}

interface CoursesProps {
    courses: Course[];
    professors: User[];
    error?: {
        message: string;
    };
}

const Courses: NextPage<CoursesProps> = ({ courses: initialCourses, professors, error }) => {
    const [searchText, setSearchText] = useState('');
    const [coursesList, setCoursesList] = useState<Course[]>(initialCourses || []);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // Afficher un message d'erreur si nécessaire
    if (error) {
        message.error(error.message);
    }

    // Mutations GraphQL
    const [createCourse, { loading: createLoading }] = useMutation(CREATE_COURSE, {
        onCompleted: (data) => {
            message.success('Cours ajouté avec succès');
            setIsAddModalVisible(false);
            addForm.resetFields();
            // Ajouter le nouveau cours à la liste
            setCoursesList([...coursesList, data.createCourse]);
        },
        onError: (error) => {
            message.error(`Erreur lors de l'ajout: ${error.message}`);
        }
    });

    const [updateCourse, { loading: updateLoading }] = useMutation(UPDATE_COURSE, {
        onCompleted: (data) => {
            message.success('Cours modifié avec succès');
            setIsEditModalVisible(false);
            // Mettre à jour le cours dans la liste
            setCoursesList(coursesList.map(course =>
                course.id === data.updateCourse.id ? data.updateCourse : course
            ));
        },
        onError: (error) => {
            message.error(`Erreur lors de la modification: ${error.message}`);
        }
    });

    const [deleteCourse, { loading: deleteLoading }] = useMutation(DELETE_COURSE, {
        onCompleted: (data) => {
            message.success('Cours supprimé avec succès');
            setIsDeleteModalVisible(false);
            // Retirer le cours de la liste
            setCoursesList(coursesList.filter(course => course.id !== data.deleteCourse.id));
        },
        onError: (error) => {
            message.error(`Erreur lors de la suppression: ${error.message}`);
        }
    });

    // Handlers pour les modals
    const showAddModal = () => {
        setIsAddModalVisible(true);
    };

    const showEditModal = (course: Course) => {
        setCurrentCourse(course);
        editForm.setFieldsValue({
            name: course.name,
            professorId: course.professor?.id
        });
        setIsEditModalVisible(true);
    };

    const showDeleteModal = (course: Course) => {
        setCurrentCourse(course);
        setIsDeleteModalVisible(true);
    };

    const handleAddSubmit = (values: any) => {
        createCourse({
            variables: {
                name: values.name,
                professorId: values.professorId
            }
        });
    };

    const handleEditSubmit = (values: any) => {
        if (!currentCourse) return;

        updateCourse({
            variables: {
                courseId: currentCourse.id,
                name: values.name,
                professorId: values.professorId
            }
        });
    };

    const handleDelete = () => {
        if (!currentCourse) return;

        deleteCourse({
            variables: {
                id: currentCourse.id
            }
        });
    };

    // Colonnes pour le tableau des cours
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => (
                <Text type="secondary" ellipsis>{text.substring(0, 8)}...</Text>
            ),
        },
        {
            title: 'Cours',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Course) => (
                <Link href={`/courses/${record.id}`}>
                    <p>{text}</p>
                </Link>
            ),
        },
        {
            title: 'Professeur',
            key: 'professor',
            render: (text: string, record: Course) => (
                record.professor ? record.professor.pseudo : 'Non assigné'
            ),
        },
        {
            title: 'Étudiants',
            key: 'students',
            render: (text: string, record: Course) => (
                <Tag color="blue">{record.students?.length || 0}</Tag>
            ),
        },
        {
            title: 'Statut',
            key: 'status',
            render: () => (
                <Badge status="processing" text="Actif" />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: string, record: Course) => (
                <Space size="small">
                    <Tooltip title="Voir les détails">
                        <Link href={`/courses/${record.id}`}>
                            <Button icon={<EyeOutlined />} size="small" type="primary" />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Modifier">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => showEditModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Supprimer">
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            size="small"
                            onClick={() => showDeleteModal(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Filtrage des cours
    const filteredCourses = coursesList.filter(course => {
        return course.name.toLowerCase().includes(searchText.toLowerCase()) ||
            course.professor?.pseudo.toLowerCase().includes(searchText.toLowerCase());
    });

    // Calcul des statistiques
    const totalCourses = coursesList.length;
    const totalStudents = coursesList.reduce((sum, course) => sum + (course.students?.length || 0), 0);

    return (
        <Layout>
            <div className="courses-page">
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Title level={2}>Gestion des cours</Title>
                        <Text type="secondary">Gérer, visualiser et rechercher les cours disponibles</Text>
                    </Col>
                    <Col>
                        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                            Ajouter un cours
                        </Button>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className="stats-overview">
                    <Col xs={24} sm={12} md={8}>
                        <Card className="dashboard-card">
                            <Statistic
                                title="Total des cours"
                                value={totalCourses}
                                prefix={<BookOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="dashboard-card">
                            <Statistic
                                title="Cours actifs"
                                value={totalCourses}
                                prefix={<ScheduleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="dashboard-card">
                            <Statistic
                                title="Total étudiants inscrits"
                                value={totalStudents}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card style={{ marginBottom: 20 }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={24} md={8}>
                            <Input
                                placeholder="Rechercher un cours..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                allowClear
                            />
                        </Col>
                    </Row>
                </Card>

                <Card>
                    <Table
                        dataSource={filteredCourses}
                        columns={columns}
                        pagination={{ pageSize: 10 }}
                        rowClassName="course-row"
                        rowKey="id"
                    />
                </Card>

                {/* Modal d'ajout de cours */}
                <Modal
                    title="Ajouter un nouveau cours"
                    visible={isAddModalVisible}
                    onCancel={() => setIsAddModalVisible(false)}
                    footer={null}
                >
                    <Form
                        form={addForm}
                        layout="vertical"
                        onFinish={handleAddSubmit}
                    >
                        <Form.Item
                            name="name"
                            label="Nom du cours"
                            rules={[{ required: true, message: 'Veuillez entrer le nom du cours' }]}
                        >
                            <Input placeholder="ex: Programmation Orientée Objet" />
                        </Form.Item>

                        <Form.Item
                            name="professorId"
                            label="Professeur"
                            rules={[{ required: true, message: 'Veuillez sélectionner un professeur' }]}
                        >
                            <Select placeholder="Sélectionner un professeur">
                                {professors.map(professor => (
                                    <Option key={professor.id} value={professor.id}>
                                        {professor.pseudo} ({professor.email})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={createLoading}
                                style={{ marginRight: 8 }}
                            >
                                Ajouter
                            </Button>
                            <Button onClick={() => setIsAddModalVisible(false)}>
                                Annuler
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal de modification de cours */}
                <Modal
                    title="Modifier un cours"
                    visible={isEditModalVisible}
                    onCancel={() => setIsEditModalVisible(false)}
                    footer={null}
                >
                    <Form
                        form={editForm}
                        layout="vertical"
                        onFinish={handleEditSubmit}
                    >
                        <Form.Item
                            name="name"
                            label="Nom du cours"
                            rules={[{ required: true, message: 'Veuillez entrer le nom du cours' }]}
                        >
                            <Input placeholder="ex: Programmation Orientée Objet" />
                        </Form.Item>

                        <Form.Item
                            name="professorId"
                            label="Professeur"
                            rules={[{ required: true, message: 'Veuillez sélectionner un professeur' }]}
                        >
                            <Select placeholder="Sélectionner un professeur">
                                {professors.map(professor => (
                                    <Option key={professor.id} value={professor.id}>
                                        {professor.pseudo} ({professor.email})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={updateLoading}
                                style={{ marginRight: 8 }}
                            >
                                Mettre à jour
                            </Button>
                            <Button onClick={() => setIsEditModalVisible(false)}>
                                Annuler
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal de confirmation de suppression */}
                <Modal
                    title="Confirmer la suppression"
                    visible={isDeleteModalVisible}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    footer={[
                        <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
                            Annuler
                        </Button>,
                        <Button
                            key="delete"
                            type="primary"
                            danger
                            loading={deleteLoading}
                            onClick={handleDelete}
                        >
                            Supprimer
                        </Button>
                    ]}
                >
                    <p>Êtes-vous sûr de vouloir supprimer le cours <strong>{currentCourse?.name}</strong> ?</p>
                    <p>Cette action est irréversible et supprimera également toutes les inscriptions des étudiants à ce cours.</p>
                </Modal>
            </div>
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
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

        try {
            // Récupérer les cours et les professeurs en parallèle
            const [coursesResponse, usersResponse] = await Promise.all([
                client.query({
                    query: GET_ALL_COURSES,
                    context: { headers }
                }),
                client.query({
                    query: GET_ALL_USERS,
                    context: { headers }
                })
            ]);

            // Filtrer pour ne récupérer que les professeurs (ROLE_ADMIN)
            const professors = usersResponse.data.getAllUsers.filter(
                (user: User) => user.role === "ROLE_ADMIN"
            );

            return {
                props: {
                    courses: coursesResponse.data.getAllCourses || [],
                    professors: professors || []
                }
            };
        } catch (error) {
            console.error('GraphQL Query Error:', error);

            // En cas d'erreur de requête
            return {
                props: {
                    courses: [],
                    professors: [],
                    error: {
                        message: error instanceof Error
                            ? error.message
                            : 'Une erreur est survenue lors du chargement des données'
                    }
                }
            };
        }
    } catch (error) {
        console.error('Error in getServerSideProps:', error);

        // En cas d'erreur majeure, rediriger vers la page de connexion
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }
};

export default Courses;
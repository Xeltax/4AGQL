import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
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
    InputNumber,
    Tabs,
    Alert,
    Avatar
} from 'antd';
import {
    AuditOutlined,
    SearchOutlined,
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import Layout from '../components/Layout/MainLayout';
import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parse } from 'cookie';
import { client } from '../lib/apolloClient';
import {
    GET_GRADES_FOR_PROFESSOR,
    GET_GRADES_FOR_STUDENT,
    CREATE_GRADE,
    UPDATE_GRADE,
    DELETE_GRADE
} from '../graphql/grades';
import { GET_ALL_COURSES } from '../graphql/courses';
import { GET_ALL_USERS } from '../graphql/users';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;

interface Student {
    id: string;
    pseudo: string;
    email: string;
}

interface Course {
    id: string;
    name: string;
    professor: {
        id: string;
        pseudo: string;
        email: string;
    };
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

interface User {
    id: string;
    pseudo: string;
    email: string;
    role: string;
}

interface GradesPageProps {
    gradesData: {
        data: {
            getGradesForProfessor?: Grade[];
            getGradesForStudent?: Grade[];
        }
    };
    coursesData: {
        data: {
            getAllCourses: Course[];
        }
    };
    usersData: {
        data: {
            getAllUsers: User[];
        }
    };
    userRole: string;
    userId: string;
    error?: string;
}

const GradesPage: NextPage<GradesPageProps> = ({ gradesData, coursesData, usersData, userRole, userId, error }) => {
    const router = useRouter();

    const [searchText, setSearchText] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');
    const [isAddGradeModalVisible, setIsAddGradeModalVisible] = useState(false);
    const [isEditGradeModalVisible, setIsEditGradeModalVisible] = useState(false);
    const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);

    // Forms
    const [addGradeForm] = Form.useForm();
    const [editGradeForm] = Form.useForm();

    // Mutations
    const [createGrade] = useMutation(CREATE_GRADE);
    const [updateGrade] = useMutation(UPDATE_GRADE);
    const [deleteGrade] = useMutation(DELETE_GRADE);

    // Obtenir les données
    const grades = gradesData?.data?.getGradesForProfessor || gradesData?.data?.getGradesForStudent || [];
    const courses = coursesData?.data?.getAllCourses || [];
    const users = usersData?.data?.getAllUsers || [];

    // Obtenir seulement les étudiants
    const students = users.filter(user => user.role === "STUDENT");

    // Fonctions pour gérer les modals
    const showAddGradeModal = () => {
        addGradeForm.resetFields();
        setIsAddGradeModalVisible(true);
    };

    const handleAddGradeCancel = () => {
        setIsAddGradeModalVisible(false);
        addGradeForm.resetFields();
    };

    const handleAddGrade = () => {
        addGradeForm.validateFields()
            .then(values => {
                createGrade({
                    variables: {
                        userId: values.studentId,
                        courseId: values.courseId,
                        note: values.note,
                        comment: values.comment || ""
                    }
                })
                    .then(() => {
                        setIsAddGradeModalVisible(false);
                        addGradeForm.resetFields();
                        // Recharger la page pour obtenir les données mises à jour
                        router.replace(router.asPath);
                    })
                    .catch(err => {
                        Modal.error({
                            title: "Erreur lors de l'ajout de la note",
                            content: err.message
                        });
                    });
            })
            .catch(info => {
                console.log('Validation Failed:', info);
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

    const handleEditGradeCancel = () => {
        setIsEditGradeModalVisible(false);
        setCurrentGrade(null);
    };

    const handleEditGrade = () => {
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
                        setIsEditGradeModalVisible(false);
                        setCurrentGrade(null);
                        // Recharger la page pour obtenir les données mises à jour
                        router.replace(router.asPath);
                    })
                    .catch(err => {
                        Modal.error({
                            title: "Erreur lors de la modification de la note",
                            content: err.message
                        });
                    });
            })
            .catch(info => {
                console.log('Validation Failed:', info);
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
                deleteGrade({
                    variables: { gradeId }
                })
                    .then(() => {
                        // Recharger la page pour obtenir les données mises à jour
                        router.replace(router.asPath);
                    })
                    .catch(err => {
                        Modal.error({
                            title: "Erreur lors de la suppression de la note",
                            content: err.message
                        });
                    });
            }
        });
    };

    // Filtrer les notes en fonction de la recherche et du filtre de cours
    const filteredGrades = grades.filter(grade => {
        const matchesSearch =
            grade.student.pseudo.toLowerCase().includes(searchText.toLowerCase()) ||
            grade.course.name.toLowerCase().includes(searchText.toLowerCase()) ||
            grade.student.email.toLowerCase().includes(searchText.toLowerCase());

        const matchesCourse = filterCourse === 'all' || grade.course.id === filterCourse;

        return matchesSearch && matchesCourse;
    });

    // Calculer les statistiques
    const totalGrades = grades.length;
    const avgGrade = grades.length > 0
        ? (grades.reduce((acc, grade) => acc + grade.note, 0) / totalGrades).toFixed(1)
        : "0.0";

    // Liste des cours pour le filtre
    const courseOptions = courses.map(course => ({
        value: course.id,
        label: `${course.name}`
    }));

    // Colonnes pour le tableau des notes
    const gradeColumns = [
        {
            title: 'Étudiant',
            dataIndex: ['student', 'pseudo'],
            key: 'student',
            render: (text: string, record: Grade) => (
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
            title: 'Cours',
            dataIndex: ['course', 'name'],
            key: 'course',
            render: (text: string, record: Grade) => (
                <div>
                    <div>{text}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.course.id}</Text>
                </div>
            ),
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            render: (note: number) => {
                let color = '';
                if (note >= 16) color = '#52c41a';
                else if (note >= 12) color = '#1890ff';
                else if (note >= 10) color = '#faad14';
                else color = '#f5222d';

                return (
                    <span style={{ color, fontWeight: 'bold' }}>
                        {note.toFixed(1)} / 20
                    </span>
                );
            }
        },
        {
            title: 'Commentaire',
            dataIndex: 'comment',
            key: 'comment',
            ellipsis: true,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: string, record: Grade) => (
                <Space size="small">
                    <Tooltip title="Voir détails">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            type="primary"
                            onClick={() => {
                                Modal.info({
                                    title: 'Détails de la note',
                                    content: (
                                        <div>
                                            <p><strong>Étudiant:</strong> {record.student.pseudo} ({record.student.email})</p>
                                            <p><strong>Cours:</strong> {record.course.name}</p>
                                            <p><strong>Note:</strong> {record.note.toFixed(1)} / 20</p>
                                            <p><strong>Commentaire:</strong> {record.comment || "Aucun commentaire"}</p>
                                        </div>
                                    ),
                                    width: 500
                                });
                            }}
                        />
                    </Tooltip>
                    {userRole === "PROFESSOR" && (
                        <>
                            <Tooltip title="Modifier">
                                <Button
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={() => showEditGradeModal(record)}
                                />
                            </Tooltip>
                            <Tooltip title="Supprimer">
                                <Button
                                    icon={<DeleteOutlined />}
                                    danger
                                    size="small"
                                    onClick={() => showDeleteGradeConfirm(record.id)}
                                />
                            </Tooltip>
                        </>
                    )}
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

    return (
        <Layout>
            <div className="grades-page">
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Title level={2}>Gestion des notes</Title>
                        <Text type="secondary">
                            {userRole === "PROFESSOR"
                                ? "Gérer et visualiser les notes des étudiants"
                                : "Consulter vos notes"}
                        </Text>
                    </Col>
                    {userRole === "PROFESSOR" && (
                        <Col>
                            <Button type="primary" icon={<PlusOutlined />} onClick={showAddGradeModal}>
                                Ajouter une note
                            </Button>
                        </Col>
                    )}
                </Row>

                <Row gutter={[16, 16]} className="stats-overview">
                    <Col xs={24} sm={12} md={8}>
                        <Card className="dashboard-card">
                            <Statistic
                                title="Notes totales"
                                value={totalGrades}
                                prefix={<AuditOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="dashboard-card">
                            <Statistic
                                title="Moyenne générale"
                                value={avgGrade}
                                prefix={<BarChartOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                                suffix="/20"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="dashboard-card">
                            <Statistic
                                title="Cours évalués"
                                value={new Set(grades.map(g => g.course.id)).size}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card style={{ marginBottom: 16 }}>
                    <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
                        <Col xs={24} sm={16} md={12}>
                            <Input
                                placeholder="Rechercher par étudiant ou cours..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={8} md={6}>
                            <Select
                                placeholder="Filtrer par cours"
                                style={{ width: '100%' }}
                                value={filterCourse}
                                onChange={value => setFilterCourse(value)}
                            >
                                <Option value="all">Tous les cours</Option>
                                {courseOptions.map(option => (
                                    <Option key={option.value} value={option.value}>{option.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>

                    {grades.length === 0 ? (
                        <Alert
                            message="Aucune note disponible"
                            description={userRole === "PROFESSOR"
                                ? "Vous n'avez pas encore ajouté de notes. Cliquez sur 'Ajouter une note' pour commencer."
                                : "Vous n'avez pas encore reçu de notes."}
                            type="info"
                            showIcon
                        />
                    ) : (
                        <Table
                            dataSource={filteredGrades}
                            columns={gradeColumns}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    )}
                </Card>
            </div>

            {/* Modal pour ajouter une note (visible seulement pour les professeurs) */}
            {userRole === "PROFESSOR" && (
                <Modal
                    title="Ajouter une nouvelle note"
                    visible={isAddGradeModalVisible}
                    onCancel={handleAddGradeCancel}
                    onOk={handleAddGrade}
                    okText="Ajouter"
                    cancelText="Annuler"
                >
                    <Form
                        form={addGradeForm}
                        layout="vertical"
                    >
                        <Form.Item
                            name="studentId"
                            label="Étudiant"
                            rules={[{ required: true, message: 'Veuillez sélectionner un étudiant' }]}
                        >
                            <Select placeholder="Sélectionner un étudiant" showSearch optionFilterProp="children">
                                {students.map(student => (
                                    <Option key={student.id} value={student.id}>
                                        {student.pseudo} ({student.email})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="courseId"
                            label="Cours"
                            rules={[{ required: true, message: 'Veuillez sélectionner un cours' }]}
                        >
                            <Select placeholder="Sélectionner un cours" showSearch optionFilterProp="children">
                                {courses.map(course => (
                                    <Option key={course.id} value={course.id}>
                                        {course.name}
                                    </Option>
                                ))}
                            </Select>
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
                            <Input.TextArea rows={4} placeholder="Commentaire sur l'évaluation..." />
                        </Form.Item>
                    </Form>
                </Modal>
            )}

            {/* Modal pour modifier une note (visible seulement pour les professeurs) */}
            {userRole === "PROFESSOR" && (
                <Modal
                    title="Modifier une note"
                    visible={isEditGradeModalVisible}
                    onCancel={handleEditGradeCancel}
                    onOk={handleEditGrade}
                    okText="Enregistrer"
                    cancelText="Annuler"
                >
                    <Form
                        form={editGradeForm}
                        layout="vertical"
                    >
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
                            <Input.TextArea rows={4} placeholder="Commentaire sur l'évaluation..." />
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </Layout>
    );
};

// Récupérer les données côté serveur avec getServerSideProps
export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req } = context;

    try {
        const cookies = req.headers.cookie || "";
        const parsedCookies = parse(cookies);
        // Récupérer le token d'authentification depuis les cookies
        const token = parsedCookies.JWT || '';

        // Vérifier l'authentification
        if (!token) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            };
        }

        // Configuration des headers d'authentification
        const headers = { authorization: `Bearer ${token}` };

        // Récupérer l'utilisateur actuel (pour détecter son rôle et ses cours si professeur)
        const userResponse = await client.query({
            query: GET_ALL_USERS,
            context: { headers }
        });

        // Récupérer tous les utilisateurs pour la liste des étudiants
        const usersData = userResponse;

        const jwt = parsedCookies.JWT || '';

        const decodedToken = JSON.parse(atob(jwt.split('.')[1]));

        // Vérifier si l'utilisateur est connecté et obtenir son rôle
        const currentUser = userResponse.data.getAllUsers.find(
            (user: User) => user.id === decodedToken.id
        );

        if (!currentUser) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            };
        }

        const userRole = currentUser.role;
        const userId = currentUser.id;

        // Récupérer les notes en fonction du rôle de l'utilisateur
        let gradesData;
        if (userRole === "ROLE_ADMIN") {
            // Si l'utilisateur est un professeur, récupérer les cours qu'il enseigne
            const coursesData = await client.query({
                query: GET_ALL_COURSES,
                context: { headers }
            });

            const professorCourses = coursesData.data.getAllCourses
                .filter((course: Course) => course.professor.id === userId)
                .map((course: Course) => course.id);

            // Récupérer les notes des cours du professeur
            gradesData = await client.query({
                query: GET_GRADES_FOR_PROFESSOR,
                variables: { courseIds: professorCourses },
                context: { headers }
            });

            return {
                props: {
                    gradesData,
                    coursesData,
                    usersData,
                    userRole,
                    userId
                }
            };
        } else if (userRole === "ROLE_USER") {
            // Si l'utilisateur est un étudiant, récupérer ses notes
            gradesData = await client.query({
                query: GET_GRADES_FOR_STUDENT,
                variables: { userId },
                context: { headers }
            });

            const coursesData = await client.query({
                query: GET_ALL_COURSES,
                context: { headers }
            });

            return {
                props: {
                    gradesData,
                    coursesData,
                    usersData,
                    userRole,
                    userId
                }
            };
        } else {
            // Si le rôle n'est ni professeur ni étudiant
            return {
                props: {
                    error: "Accès non autorisé. Seuls les professeurs et les étudiants peuvent accéder à cette page.",
                    gradesData: null,
                    coursesData: null,
                    usersData: null,
                    userRole,
                    userId
                }
            };
        }
    } catch (error) {
        return {
            props: {
                error: `Une erreur s'est produite lors de la récupération des données: ${error instanceof Error ? error.message : String(error)}`,
                gradesData: null,
                coursesData: null,
                usersData: null,
                userRole: "",
                userId: ""
            }
        };
    }
};

export default GradesPage;
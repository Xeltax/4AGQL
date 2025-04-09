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
    Avatar,
    Select,
    Badge,
    Modal,
    Form,
    message
} from 'antd';
import {
    UserOutlined,
    SearchOutlined,
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import Layout from '../components/Layout/MainLayout';
import type { NextPage, GetServerSideProps } from 'next';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import { parse } from 'cookie';
import { client } from '../lib/apolloClient';
import { GET_ALL_USERS, REGISTER, UPDATE_USER, DELETE_USER } from '../graphql/users';
import {getCookie} from "cookies-next";

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
    id: string;
    email: string;
    pseudo: string;
    role: string;
    enrolledCourses?: any[];
}

interface StudentsProps {
    users: User[];
    error?: {
        message: string;
    };
}

const Students: NextPage<StudentsProps> = ({ users, error }) => {
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [studentsList, setStudentsList] = useState<User[]>(users || []);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const token = getCookie('JWT') || '';

    // Afficher un message d'erreur si nécessaire
    if (error) {
        message.error(error.message);
    }

    // Mutations GraphQL
    const [registerUser, { loading: registerLoading }] = useMutation(REGISTER, {
        onCompleted: (data) => {
            console.log(data);
            message.success('Étudiant ajouté avec succès');
            setIsAddModalVisible(false);
            addForm.resetFields();
            // Ajouter le nouvel utilisateur à la liste
            setStudentsList([...studentsList, data.register]);
        },
        onError: (error) => {
            message.error(`Erreur lors de l'ajout: ${error.message}`);
        }
    });

    const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
        context: {
            headers: {
                authorization: `Bearer ${token}`
            }
        },
        onCompleted: (data) => {
            message.success('Étudiant modifié avec succès');
            setIsEditModalVisible(false);
            // Mettre à jour l'utilisateur dans la liste
            setStudentsList(studentsList.map(user =>
                user.id === data.updateUser.id ? data.updateUser : user
            ));
        },
        onError: (error) => {
            message.error(`Erreur lors de la modification: ${error.message}`);
        }
    });

    const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER, {
        context: {
            headers: {
                authorization: `Bearer ${token}`
            }
        },
        onCompleted: (data) => {
            message.success('Étudiant supprimé avec succès');
            setIsDeleteModalVisible(false);
            // Retirer l'utilisateur de la liste
            setStudentsList(studentsList.filter(user => user.id !== data.deleteUser.id));
        },
        onError: (error) => {
            message.error(`Erreur lors de la suppression: ${error.message}`);
        }
    });

    // Handlers pour les modals
    const showAddModal = () => {
        setIsAddModalVisible(true);
    };

    const showEditModal = (user: User) => {
        setCurrentUser(user);
        editForm.setFieldsValue({
            email: user.email,
            pseudo: user.pseudo
        });
        setIsEditModalVisible(true);
    };

    const showDeleteModal = (user: User) => {
        setCurrentUser(user);
        setIsDeleteModalVisible(true);
    };

    const handleAddSubmit = (values: any) => {
        registerUser({
            variables: {
                email: values.email,
                pseudo: values.pseudo,
                password: values.password,
                role: "ROLE_USER" // Les étudiants sont toujours ROLE_USER
            }
        });
    };

    const handleEditSubmit = (values: any) => {
        if (!currentUser) return;

        console.log(values);

        updateUser({
            variables: {
                id: currentUser.id,
                email: values.email,
                pseudo: values.pseudo,
                ...(values.password ? { password: values.password } : {})
            }
        });
    };

    const handleDelete = () => {
        if (!currentUser) return;

        deleteUser({
            variables: {
                id: currentUser.id
            }
        });
    };

    // Colonnes pour le tableau des étudiants
    const columns = [
        {
            title: 'Étudiant',
            dataIndex: 'pseudo',
            key: 'pseudo',
            render: (text: string, record: User) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <div>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.id.substring(0, 8)}</Text>
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
            title: 'Cours suivis',
            key: 'courses',
            render: (text: string, record: User) => (
                <>
                    {record.enrolledCourses && record.enrolledCourses.length > 0 ? (
                        record.enrolledCourses.map((course, index) => (
                            <Tag color="blue" key={index}>
                                {course.name}
                            </Tag>
                        ))
                    ) : (
                        <Text type="secondary">Aucun cours</Text>
                    )}
                </>
            ),
        },
        {
            title: 'Statut',
            key: 'status',
            render: () => (
                <Badge
                    status="success"
                    text="Actif"
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: string, record: User) => (
                <Space size="middle">
                    <Link href={`/students/${record.id}`}>
                        <Button type="primary" icon={<EyeOutlined />} size="small">
                            Profil
                        </Button>
                    </Link>
                    <Button
                        type="default"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => showEditModal(record)}
                    >
                        Modifier
                    </Button>
                    <Button
                        type="default"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => showDeleteModal(record)}
                    >
                        Supprimer
                    </Button>
                </Space>
            ),
        },
    ];

    // Filtrage des étudiants
    const filteredStudents = studentsList.filter(student => {
        const matchesSearch =
            student.pseudo.toLowerCase().includes(searchText.toLowerCase()) ||
            student.email.toLowerCase().includes(searchText.toLowerCase());

        // Comme nous n'avons pas le statut dans l'API, le filtre par statut est ignoré
        return matchesSearch;
    });

    return (
        <Layout>
            <div className="students-page">
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Title level={2}>Gestion des étudiants</Title>
                        <Text type="secondary">Gérer, visualiser et rechercher les étudiants</Text>
                    </Col>
                    <Col>
                        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                            Ajouter un étudiant
                        </Button>
                    </Col>
                </Row>

                <Card style={{ marginBottom: 20 }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} md={8} lg={10}>
                            <Input
                                placeholder="Rechercher un étudiant..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Select
                                placeholder="Statut"
                                style={{ width: '100%' }}
                                value={filterStatus}
                                onChange={value => setFilterStatus(value)}
                                disabled // Désactivé car nous n'avons pas cette information dans l'API
                            >
                                <Option value="all">Tous</Option>
                                <Option value="active">Actifs</Option>
                                <Option value="inactive">Inactifs</Option>
                            </Select>
                        </Col>
                    </Row>
                </Card>

                <Card>
                    <Table
                        dataSource={filteredStudents}
                        columns={columns}
                        pagination={{ pageSize: 10 }}
                        rowClassName="student-row"
                        rowKey="id"
                    />
                </Card>

                {/* Modal pour ajouter un nouvel étudiant */}
                <Modal
                    title="Ajouter un étudiant"
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
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Veuillez saisir un email' },
                                { type: 'email', message: 'Email invalide' }
                            ]}
                        >
                            <Input placeholder="Email de l'étudiant" />
                        </Form.Item>
                        <Form.Item
                            name="pseudo"
                            label="Nom d'utilisateur"
                            rules={[
                                { required: true, message: 'Veuillez saisir un nom d\'utilisateur' }
                            ]}
                        >
                            <Input placeholder="Nom d'utilisateur de l'étudiant" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label="Mot de passe"
                            rules={[
                                { required: true, message: 'Veuillez saisir un mot de passe' },
                                { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
                            ]}
                        >
                            <Input.Password placeholder="Mot de passe de l'étudiant" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={registerLoading} style={{ marginRight: 8 }}>
                                Ajouter
                            </Button>
                            <Button onClick={() => setIsAddModalVisible(false)}>
                                Annuler
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal pour modifier un étudiant */}
                <Modal
                    title="Modifier un étudiant"
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
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Veuillez saisir un email' },
                                { type: 'email', message: 'Email invalide' }
                            ]}
                        >
                            <Input placeholder="Email de l'étudiant" />
                        </Form.Item>
                        <Form.Item
                            name="pseudo"
                            label="Nom d'utilisateur"
                            rules={[
                                { required: true, message: 'Veuillez saisir un nom d\'utilisateur' }
                            ]}
                        >
                            <Input placeholder="Nom d'utilisateur de l'étudiant" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label="Nouveau mot de passe (optionnel)"
                            rules={[
                                { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
                            ]}
                        >
                            <Input.Password placeholder="Laisser vide pour conserver l'actuel" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={updateLoading} style={{ marginRight: 8 }}>
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
                    <p>Êtes-vous sûr de vouloir supprimer l'étudiant {currentUser?.pseudo} ?</p>
                    <p>Cette action est irréversible.</p>
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

        // Configuration des headers d'authentification pour Apollo Client
        const headers = token ? { authorization: `Bearer ${token}` } : {};

        // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
        if (!token) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            };
        }

        try {
            // Récupérer tous les utilisateurs
            const { data } = await client.query({
                query: GET_ALL_USERS,
                context: { headers }
            });

            // Filtrer pour ne garder que les utilisateurs avec le rôle ROLE_USER (les étudiants)
            const students = data.getAllUsers.filter((user: User) => user.role === "ROLE_USER");

            return {
                props: {
                    users: students || []
                }
            };
        } catch (error) {
            console.error('GraphQL Query Error:', error);

            // En cas d'erreur de requête, on retourne une liste vide
            return {
                props: {
                    users: [],
                    error: {
                        message: error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des données'
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

export default Students;
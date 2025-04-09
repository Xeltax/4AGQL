import React, { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useMutation } from '@apollo/client';
import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Button,
    Tabs,
    Typography,
    message,
    Divider,
    Space,
    Avatar,
    Upload,
    Alert,
    Skeleton,
    Select
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    SaveOutlined,
    UploadOutlined
} from '@ant-design/icons';
import Layout from '../components/Layout/MainLayout';
import { client } from '../lib/apolloClient';
import { GET_USER_BY_EMAIL, UPDATE_USER } from '../graphql/users';
import { parse } from 'cookie';
import {getCookie} from "cookies-next";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface User {
    id: string;
    email: string;
    pseudo: string;
    role: string;
    enrolledCourses?: {
        id: string;
        name: string;
    }[];
    taughtCourses?: {
        id: string;
        name: string;
    }[];
}

interface UserSettingsProps {
    userData: {
        data: {
            getUserByEmail: User;
        }
    };
    error?: string;
}

const UserSettings: NextPage<UserSettingsProps> = ({ userData, error }) => {
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const token = getCookie('JWT') || '';

    // Mutation pour mettre à jour l'utilisateur
    const [updateUser] = useMutation(UPDATE_USER, {
        context: {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    });

    // Si erreur
    if (error) {
        return (
            <Layout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <Alert
                        message="Erreur"
                        description={error}
                        type="error"
                        showIcon
                    />
                </div>
            </Layout>
        );
    }

    // Si pas de données
    if (!userData || !userData.data || !userData.data.getUserByEmail) {
        return (
            <Layout>
                <div style={{ padding: '20px' }}>
                    <Skeleton active />
                </div>
            </Layout>
        );
    }

    const user = userData.data.getUserByEmail;

    // Initialiser le formulaire avec les données de l'utilisateur
    React.useEffect(() => {
        profileForm.setFieldsValue({
            pseudo: user.pseudo,
            email: user.email
        });
    }, [user, profileForm]);

    // Fonction pour mettre à jour le profil
    const handleProfileUpdate = (values: any) => {
        setLoading(true);
        updateUser({
            variables: {
                id: user.id,
                pseudo: values.pseudo,
                email: values.email
            }
        })
            .then(() => {
                message.success('Profil mis à jour avec succès');
                setLoading(false);
            })
            .catch(err => {
                message.error(`Erreur lors de la mise à jour du profil: ${err.message}`);
                setLoading(false);
            });
    };

    // Fonction pour changer le mot de passe
    const handlePasswordUpdate = (values: any) => {
        setLoading(true);
        updateUser({
            variables: {
                id: user.id,
                password: values.newPassword
            }
        })
            .then(() => {
                message.success('Mot de passe mis à jour avec succès');
                setLoading(false);
                passwordForm.resetFields();
            })
            .catch(err => {
                message.error(`Erreur lors de la mise à jour du mot de passe: ${err.message}`);
                setLoading(false);
            });
    };

    return (
        <Layout>
            <div className="settings-page">
                <Row justify="center">
                    <Col xs={24} sm={22} md={20} lg={18} xl={16}>
                        <Title level={2}>Paramètres du compte</Title>
                        <Text type="secondary">Gérez vos informations personnelles et votre mot de passe</Text>

                        <Card style={{ marginTop: 20 }}>
                            <Tabs defaultActiveKey="1" onChange={key => setActiveTab(key)}>
                                <TabPane tab="Profil" key="1">
                                    <Row gutter={[24, 24]}>
                                        <Col xs={24} md={8}>
                                            <div style={{ textAlign: 'center' }}>
                                                <Avatar
                                                    size={100}
                                                    icon={<UserOutlined />}
                                                    style={{ marginBottom: 16 }}
                                                />
                                                <div>
                                                    <Upload
                                                        showUploadList={false}
                                                        beforeUpload={() => {
                                                            message.info('La fonctionnalité de changement d\'avatar n\'est pas encore disponible');
                                                            return false;
                                                        }}
                                                    >
                                                    </Upload>
                                                </div>
                                                <Divider />
                                                <div style={{ textAlign: 'left' }}>
                                                    <p><strong>Rôle:</strong> {user.role === 'ROLE_ADMIN' ? 'Professeur' : user.role === 'ROLE_USER' ? 'Étudiant' : user.role}</p>
                                                    <p><strong>ID:</strong> {user.id}</p>
                                                    <p><strong>Membre depuis:</strong> Janvier 2023</p>
                                                </div>
                                            </div>
                                        </Col>

                                        <Col xs={24} md={16}>
                                            <Title level={4}>Informations personnelles</Title>
                                            <Form
                                                form={profileForm}
                                                layout="vertical"
                                                onFinish={handleProfileUpdate}
                                            >
                                                <Form.Item
                                                    name="pseudo"
                                                    label="Nom d'utilisateur"
                                                    rules={[{ required: true, message: 'Veuillez saisir votre nom d\'utilisateur' }]}
                                                >
                                                    <Input
                                                        prefix={<UserOutlined />}
                                                        placeholder="Nom d'utilisateur"
                                                    />
                                                </Form.Item>

                                                <Form.Item
                                                    name="email"
                                                    label="Email"
                                                    rules={[
                                                        { required: true, message: 'Veuillez saisir votre email' },
                                                        { type: 'email', message: 'Veuillez saisir un email valide' }
                                                    ]}
                                                >
                                                    <Input
                                                        prefix={<MailOutlined />}
                                                        placeholder="Email"
                                                    />
                                                </Form.Item>

                                                <Form.Item>
                                                    <Button
                                                        type="primary"
                                                        htmlType="submit"
                                                        icon={<SaveOutlined />}
                                                        loading={loading && activeTab === '1'}
                                                    >
                                                        Enregistrer les modifications
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                        </Col>
                                    </Row>
                                </TabPane>

                                <TabPane tab="Sécurité" key="2">
                                    <Title level={4}>Changer de mot de passe</Title>
                                    <Form
                                        form={passwordForm}
                                        layout="vertical"
                                        onFinish={handlePasswordUpdate}
                                    >
                                        <Form.Item
                                            name="currentPassword"
                                            label="Mot de passe actuel"
                                            rules={[{ required: true, message: 'Veuillez saisir votre mot de passe actuel' }]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined />}
                                                placeholder="Mot de passe actuel"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="newPassword"
                                            label="Nouveau mot de passe"
                                            rules={[
                                                { required: true, message: 'Veuillez saisir votre nouveau mot de passe' },
                                                { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
                                            ]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined />}
                                                placeholder="Nouveau mot de passe"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="confirmPassword"
                                            label="Confirmer le mot de passe"
                                            dependencies={['newPassword']}
                                            rules={[
                                                { required: true, message: 'Veuillez confirmer votre mot de passe' },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('newPassword') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error('Les deux mots de passe ne correspondent pas'));
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined />}
                                                placeholder="Confirmer le mot de passe"
                                            />
                                        </Form.Item>

                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<SaveOutlined />}
                                                loading={loading && activeTab === '2'}
                                            >
                                                Mettre à jour le mot de passe
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>
                </Row>
            </div>
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

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userEmail = decodedToken.email || '';

        // Vérifier l'authentification
        if (!token || !userEmail) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            };
        }

        // Configuration des headers d'authentification
        const headers = { authorization: `Bearer ${token}` };

        // Récupérer les données de l'utilisateur
        const userData = await client.query({
            query: GET_USER_BY_EMAIL,
            variables: { email: userEmail },
            context: { headers }
        });

        return {
            props: {
                userData
            }
        };
    } catch (error) {
        return {
            props: {
                error: `Une erreur s'est produite lors de la récupération des données: ${error instanceof Error ? error.message : String(error)}`,
                userData: null
            }
        };
    }
};

export default UserSettings;
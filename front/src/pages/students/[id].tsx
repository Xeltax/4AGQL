import React from 'react';
import { useRouter } from 'next/router';
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    Progress,
    Typography,
    Space,
    Tabs,
    Badge,
    Tag,
    Avatar,
    Descriptions,
    Button,
    Alert,
    Spin,
    Empty
} from 'antd';
import {
    UserOutlined,
    BookOutlined,
    TrophyOutlined,
    HistoryOutlined,
    CalendarOutlined,
    MessageOutlined,
    MailOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import Layout from '../../components/Layout/MainLayout';
import type { NextPage, GetServerSideProps } from 'next';
import Link from 'next/link';
import { parse } from 'cookie';
import { client } from '../../lib/apolloClient';
import { GET_ALL_USERS } from '../../graphql/users';
import { GET_GRADES_FOR_STUDENT } from '../../graphql/grades';
import { GET_COURSE_BY_ID } from '../../graphql/courses';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface User {
    id: string;
    email: string;
    pseudo: string;
    role: string;
    enrolledCourses?: any[];
    createdAt?: string;
}

interface Grade {
    id: string;
    note: number;
    comment: string;
    course: {
        id: string;
        name: string;
    };
    createdAt?: string;
}

interface StudentProfileProps {
    user: User | null;
    grades: Grade[];
    error?: string;
}

const StudentProfile: NextPage<StudentProfileProps> = ({ user, grades, error }) => {
    const router = useRouter();

    // Gérer le cas où l'utilisateur n'est pas trouvé ou s'il y a une erreur
    if (!user) {
        return (
            <Layout>
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Title level={3}>
                        {error || "L'étudiant demandé n'a pas été trouvé"}
                    </Title>
                    <Button
                        type="primary"
                        onClick={() => router.push('/students')}
                        style={{ marginTop: 16 }}
                    >
                        Retour à la liste des étudiants
                    </Button>
                </div>
            </Layout>
        );
    }

    // Calcul des statistiques
    const averageGrade = grades.length
        ? (grades.reduce((sum, grade) => sum + grade.note, 0) / grades.length).toFixed(2)
        : "N/A";

    const coursesCount = user.enrolledCourses?.length || 0;
    const totalCredits = 0; // Info non disponible dans l'API actuelle

    // Colonnes pour l'onglet des cours
    const courseColumns = [
        {
            title: 'Cours',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Professeur',
            key: 'professor',
            render: (text: string, record: any) => (
                record.professor?.pseudo || 'Non disponible'
            ),
        },
        {
            title: 'Statut',
            key: 'status',
            render: () => (
                <Badge status="processing" text="Inscrit" />
            ),
        }
    ];

    // Colonnes pour l'onglet des notes
    const gradeColumns = [
        {
            title: 'Cours',
            dataIndex: ['course', 'name'],
            key: 'course',
        },
        {
            title: 'Note',
            dataIndex: 'note',
            key: 'note',
            render: (note: number) => (
                <span style={{ color: note >= 16 ? '#52c41a' : note >= 12 ? '#1890ff' : '#f5222d' }}>
                    {note}/20
                </span>
            )
        },
        {
            title: 'Commentaire',
            dataIndex: 'comment',
            key: 'comment',
        },
        {
            title: 'Date',
            key: 'date',
            render: (text: string, record: Grade) => (
                record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'Non disponible'
            ),
        },
    ];

    return (
        <Layout>
            <div className="student-profile">
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Title level={2}>Profil étudiant</Title>
                        <Text type="secondary">Informations détaillées et performances</Text>
                    </Col>
                    <Col>
                        <Space>
                            <Link href="/students">
                                <Button icon={<ArrowLeftOutlined />}>
                                    Retour à la liste
                                </Button>
                            </Link>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Card className="student-info-card">
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <Avatar size={100} icon={<UserOutlined />} />
                                <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>{user.pseudo}</Title>
                                <Text type="secondary">{user.id}</Text>
                                <div style={{ marginTop: 16 }}>
                                    <Tag color="blue">Étudiant</Tag>
                                    <Badge status="success" text="Actif" />
                                </div>
                            </div>

                            <Descriptions
                                title="Informations personnelles"
                                layout="vertical"
                                column={1}
                                bordered
                                size="small"
                            >
                                <Descriptions.Item label="Email">
                                    <Space>
                                        <MailOutlined />
                                        {user.email}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Rôle">
                                    {user.role === 'ROLE_USER' ? 'Étudiant' : 'Administrateur'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Cours suivis">
                                    {coursesCount} cours
                                </Descriptions.Item>
                                {user.createdAt && (
                                    <Descriptions.Item label="Date d'inscription">
                                        <Space>
                                            <CalendarOutlined />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </Space>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col xs={24} md={16}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Card className="dashboard-card">
                                    <Statistic
                                        title="Moyenne générale"
                                        value={averageGrade}
                                        suffix="/20"
                                        valueStyle={{ color: '#3f8600' }}
                                        prefix={<TrophyOutlined />}
                                    />
                                    {averageGrade !== "N/A" && (
                                        <Progress
                                            percent={parseFloat(averageGrade) / 20 * 100}
                                            status="active"
                                            strokeColor={{
                                                '0%': '#108ee9',
                                                '100%': '#87d068',
                                            }}
                                        />
                                    )}
                                </Card>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Card className="dashboard-card">
                                    <Statistic
                                        title="Cours suivis"
                                        value={coursesCount}
                                        prefix={<BookOutlined />}
                                    />
                                    <Progress
                                        percent={coursesCount / 10 * 100} // Arbitraire, à ajuster
                                        status="active"
                                        format={() => `${coursesCount}`}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Card className="dashboard-card">
                                    <Statistic
                                        title="Notes obtenues"
                                        value={grades.length}
                                        prefix={<BookOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Card className="dashboard-card">
                                    <Statistic
                                        title="Date d'inscription"
                                        value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                        prefix={<CalendarOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {grades.length === 0 && (
                            <Card style={{ marginTop: 16 }}>
                                <Alert
                                    message="Information"
                                    description="Cet étudiant n'a pas encore de notes enregistrées."
                                    type="info"
                                    showIcon
                                />
                            </Card>
                        )}

                        {coursesCount === 0 && (
                            <Card style={{ marginTop: 16 }}>
                                <Alert
                                    message="Information"
                                    description="Cet étudiant n'est inscrit à aucun cours pour le moment."
                                    type="info"
                                    showIcon
                                />
                            </Card>
                        )}
                    </Col>
                </Row>

                <Card style={{ marginTop: 16 }}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Cours suivis" key="1">
                            {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
                                <Table
                                    dataSource={user.enrolledCourses}
                                    columns={courseColumns}
                                    pagination={false}
                                    rowKey="id"
                                />
                            ) : (
                                <Empty description="Aucun cours suivi pour le moment" />
                            )}
                        </TabPane>

                        <TabPane tab="Notes" key="2">
                            {grades.length > 0 ? (
                                <Table
                                    dataSource={grades}
                                    columns={gradeColumns}
                                    pagination={false}
                                    rowKey="id"
                                />
                            ) : (
                                <Empty description="Aucune note enregistrée pour le moment" />
                            )}
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const { id } = context.params || {};

        if (!id) {
            return {
                props: {
                    user: null,
                    grades: [],
                    error: "ID d'étudiant non spécifié"
                }
            };
        }

        const cookies = context.req.headers.cookie || "";
        const parsedCookies = parse(cookies);
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

        const headers = { authorization: `Bearer ${token}` };

        try {
            // 1. Récupérer tous les utilisateurs pour trouver celui avec l'ID correspondant
            // (Idéalement, tu aurais une requête getUserById dans ton API)
            const usersResponse = await client.query({
                query: GET_ALL_USERS,
                context: { headers }
            });

            // Trouver l'utilisateur spécifique
            const user = usersResponse.data.getAllUsers.find((u: User) => u.id === id);

            if (!user) {
                return {
                    props: {
                        user: null,
                        grades: [],
                        error: "Étudiant non trouvé"
                    }
                };
            }

            // 2. Récupérer les notes de l'étudiant
            const gradesResponse = await client.query({
                query: GET_GRADES_FOR_STUDENT,
                variables: { userId: id },
                context: { headers }
            });

            // 3. Si l'utilisateur a des cours inscrits qui n'ont pas les détails du professeur,
            // on pourrait les récupérer individuellement ici

            return {
                props: {
                    user,
                    grades: gradesResponse.data.getGradesForStudent || []
                }
            };

        } catch (error) {
            console.error('GraphQL Query Error:', error);
            return {
                props: {
                    user: null,
                    grades: [],
                    error: error instanceof Error ? error.message : "Erreur lors de la récupération des données"
                }
            };
        }
    } catch (error) {
        console.error('Error in getServerSideProps:', error);
        return {
            redirect: {
                destination: '/students',
                permanent: false,
            },
        };
    }
};

export default StudentProfile;
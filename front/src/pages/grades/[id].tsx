import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
    Row,
    Col,
    Card,
    Descriptions,
    Typography,
    Space,
    Tag,
    Button,
    Avatar,
    Divider,
    List,
    Form,
    Input,
    Rate,
    Badge,
    Timeline,
    Tooltip,
    Modal,
    InputNumber,
    Radio
} from 'antd';
import {
    UserOutlined,
    BookOutlined,
    CheckCircleOutlined,
    EditOutlined,
    MessageOutlined,
    FileTextOutlined,
    HistoryOutlined,
    MailOutlined,
    ExclamationCircleOutlined,
    BarChartOutlined,
    LockOutlined,
    UnlockOutlined
} from '@ant-design/icons';
import Layout from '../../components/Layout/MainLayout';
import type { NextPage } from 'next';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const GradeDetail: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [comment, setComment] = useState('');
    const [form] = Form.useForm();

    // Mock grade data for demonstration
    const grade = {
        id: 'GRD-1001',
        student: 'Emma Martin',
        studentId: 'STU-1001',
        course: 'Programmation Orientée Objet',
        courseCode: 'INF-301',
        type: 'Examen',
        professor: 'Dr. Pierre Durand',
        date: '2025-02-15',
        submitDate: '2025-02-15',
        gradeDate: '2025-02-18',
        publishDate: '2025-02-20',
        grade: 18.5,
        maxGrade: 20,
        coefficient: 2,
        comment: 'Excellent travail, maîtrise parfaite des concepts. Très bonne compréhension des principes de la POO et implémentation efficace des solutions.',
        status: 'published',
        history: [
            {
                date: '2025-02-15',
                action: 'Création',
                user: 'Dr. Pierre Durand',
                details: 'Note initiale: 18.0/20'
            },
            {
                date: '2025-02-18',
                action: 'Modification',
                user: 'Dr. Pierre Durand',
                details: 'Note modifiée: 18.0 → 18.5/20'
            },
            {
                date: '2025-02-20',
                action: 'Publication',
                user: 'Dr. Pierre Durand',
                details: 'Note publiée aux étudiants'
            }
        ],
        comments: [
            {
                author: 'Dr. Pierre Durand',
                avatar: <Avatar icon={<UserOutlined />} />,
                content: 'Excellente réponse à la question 3, bravo!',
                datetime: '2025-02-18 10:23'
            },
            {
                author: 'Emma Martin',
                avatar: <Avatar icon={<UserOutlined />} />,
                content: 'Merci pour vos encouragements, j\'ai beaucoup travaillé sur ce sujet.',
                datetime: '2025-02-21 14:05'
            }
        ],
        rubrics: [
            {
                name: 'Compréhension des concepts',
                score: 9.5,
                maxScore: 10,
                weight: 40,
                comment: 'Excellente maîtrise des concepts de base et avancés'
            },
            {
                name: 'Application pratique',
                score: 4.5,
                maxScore: 5,
                weight: 20,
                comment: 'Très bonne application des concepts théoriques'
            },
            {
                name: 'Résolution de problèmes',
                score: 4,
                maxScore: 5,
                weight: 20,
                comment: 'Solutions efficaces et bien optimisées'
            },
            {
                name: 'Présentation et clarté',
                score: 3.5,
                maxScore: 5,
                weight: 20,
                comment: 'Présentation claire mais quelques imprécisions mineures'
            }
        ]
    };

    // Student details
    const student = {
        id: 'STU-1001',
        name: 'Emma Martin',
        email: 'emma.martin@example.com',
        avatar: '/path/to/avatar.jpg',
        currentAverage: 17.5,
        courseGrades: [
            { id: 'GRD-1001', course: 'Programmation Orientée Objet', type: 'Examen', date: '2025-02-15', grade: 18.5 },
            { id: 'GRD-1006', course: 'Bases de Données Avancées', type: 'TP', date: '2025-02-10', grade: 17.0 },
            { id: 'GRD-1008', course: 'Intelligence Artificielle', type: 'Projet', date: '2025-03-01', grade: 16.0 }
        ]
    };

    const handleEditGrade = () => {
        setIsEditModalVisible(true);
        form.setFieldsValue({
            grade: grade.grade,
            comment: grade.comment,
            status: grade.status
        });
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
    };

    const handleEditSubmit = () => {
        form.validateFields()
            .then(values => {
                console.log('Form values:', values);
                // Logic to update the grade would go here
                setIsEditModalVisible(false);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const handleCommentSubmit = () => {
        if (comment.trim()) {
            console.log('Submitted comment:', comment);
            setComment('');
            // Logic to add the comment would go here
        }
    };

    // Calculate total score from rubrics
    const totalWeightedScore = grade.rubrics.reduce((total, rubric) =>
        total + ((rubric.score / rubric.maxScore) * rubric.weight), 0);

    // Calculate score out of max grade
    const calculatedGrade = (totalWeightedScore / 100) * grade.maxGrade;

    return (
        <Layout>
            <div className="grade-detail">
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Space direction="vertical" size={4}>
                            <Title level={2} style={{ marginBottom: 0 }}>
                                Détail de la note {grade.id}
                            </Title>
                            <Text type="secondary">
                                {grade.course} - {grade.type}
                            </Text>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<BarChartOutlined />}>
                                Statistiques
                            </Button>
                            <Button icon={<MessageOutlined />}>
                                Contacter l'étudiant
                            </Button>
                            <Button icon={<EditOutlined />} type="primary" onClick={handleEditGrade}>
                                Modifier la note
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                        <Card>
                            <Descriptions
                                title="Informations générales"
                                bordered
                                layout="vertical"
                                column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                            >
                                <Descriptions.Item label="Étudiant">
                                    <Space>
                                        <Avatar icon={<UserOutlined />} />
                                        <div>
                                            <div><a href={`/students/${grade.studentId}`}>{grade.student}</a></div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>{grade.studentId}</Text>
                                        </div>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Cours">
                                    <Space>
                                        <BookOutlined />
                                        <div>
                                            <div><a href={`/courses/${grade.courseCode}`}>{grade.course}</a></div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>{grade.courseCode}</Text>
                                        </div>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Type d'évaluation">
                                    <Tag color="blue">{grade.type}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Note">
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                                        {grade.grade} / {grade.maxGrade}
                                    </div>
                                    <div>
                                        <Text type="secondary">Coefficient: {grade.coefficient}</Text>
                                    </div>
                                </Descriptions.Item>
                                <Descriptions.Item label="Statut">
                                    <Badge
                                        status={grade.status === 'published' ? 'success' : 'warning'}
                                        text={grade.status === 'published' ? 'Publiée' : 'Brouillon'}
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="Professeur">
                                    <Space>
                                        <Avatar icon={<UserOutlined />} />
                                        {grade.professor}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Date d'évaluation">
                                    {grade.date}
                                </Descriptions.Item>
                                <Descriptions.Item label="Date de soumission">
                                    {grade.submitDate}
                                </Descriptions.Item>
                                <Descriptions.Item label="Date de notation">
                                    {grade.gradeDate}
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider />

                            <div>
                                <Title level={5}>Commentaire de l'évaluateur</Title>
                                <Paragraph style={{ background: '#f9f9f9', padding: 16, borderRadius: 4 }}>
                                    {grade.comment}
                                </Paragraph>
                            </div>

                            <Divider />

                            <div>
                                <Title level={5}>Grille d'évaluation</Title>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={grade.rubrics}
                                    renderItem={item => (
                                        <List.Item>
                                            <div style={{ width: '100%' }}>
                                                <Row align="middle">
                                                    <Col span={12}>
                                                        <Text strong>{item.name}</Text>
                                                        <div>
                                                            <Text type="secondary">Poids: {item.weight}%</Text>
                                                        </div>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Rate
                                                            disabled
                                                            allowHalf
                                                            defaultValue={item.score / (item.maxScore / 5)}
                                                            style={{ fontSize: 16 }}
                                                        />
                                                    </Col>
                                                    <Col span={4} style={{ textAlign: 'right' }}>
                                                        <Text strong style={{ fontSize: 16 }}>
                                                            {item.score}/{item.maxScore}
                                                        </Text>
                                                    </Col>
                                                </Row>
                                                {item.comment && (
                                                    <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: '2px solid #eee' }}>
                                                        <Text type="secondary">{item.comment}</Text>
                                                    </div>
                                                )}
                                            </div>
                                        </List.Item>
                                    )}
                                    footer={
                                        <div style={{ textAlign: 'right' }}>
                                            <Text strong>Score total: </Text>
                                            <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                                {calculatedGrade.toFixed(1)}/{grade.maxGrade}
                                            </Text>
                                        </div>
                                    }
                                />
                            </div>
                        </Card>

                        <Card style={{ marginTop: 16 }}>
                            <div>
                                <Title level={5}>Conversation</Title>
                                <List
                                    className="comment-list"
                                    itemLayout="horizontal"
                                    dataSource={grade.comments}
                                    renderItem={item => (
                                        <li>
                                            {/*<Comment*/}
                                            {/*    author={item.author}*/}
                                            {/*    avatar={item.avatar}*/}
                                            {/*    content={item.content}*/}
                                            {/*    datetime={item.datetime}*/}
                                            {/*/>*/}
                                        </li>
                                    )}
                                />
                                <div style={{ marginTop: 16 }}>
                                    <Form.Item>
                                        <TextArea
                                            rows={4}
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            placeholder="Ajouter un commentaire..."
                                        />
                                    </Form.Item>
                                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                                        <Button
                                            htmlType="submit"
                                            type="primary"
                                            onClick={handleCommentSubmit}
                                            disabled={!comment.trim()}
                                        >
                                            Ajouter
                                        </Button>
                                    </Form.Item>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card style={{ marginBottom: 16 }}>
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <Avatar size={80} icon={<UserOutlined />} />
                                <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>{student.name}</Title>
                                <Text type="secondary">{student.id}</Text>
                                <div style={{ marginTop: 8 }}>
                                    <Space>
                                        <MailOutlined />
                                        <a href={`mailto:${student.email}`}>{student.email}</a>
                                    </Space>
                                </div>
                            </div>
                            <Divider />
                            <div>
                                <Title level={5}>Moyenne actuelle</Title>
                                <div style={{ textAlign: 'center' }}>
                  <span style={{
                      fontSize: 36,
                      fontWeight: 'bold',
                      color: student.currentAverage >= 16 ? '#52c41a' :
                          student.currentAverage >= 12 ? '#1890ff' :
                              student.currentAverage >= 10 ? '#faad14' : '#f5222d'
                  }}>
                    {student.currentAverage}
                  </span>
                                    <span style={{ fontSize: 20 }}>/20</span>
                                </div>
                            </div>
                            <Divider />
                            <div>
                                <Title level={5}>Autres notes dans ce cours</Title>
                                <List
                                    size="small"
                                    dataSource={student.courseGrades.filter(g => g.course === grade.course && g.id !== grade.id)}
                                    renderItem={item => (
                                        <List.Item
                                            actions={[
                                                <a key="view" href={`/grades/${item.id}`}>Voir</a>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={<a href={`/grades/${item.id}`}>{item.type}</a>}
                                                description={`${item.date}`}
                                            />
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: item.grade >= 16 ? '#52c41a' :
                                                    item.grade >= 12 ? '#1890ff' :
                                                        item.grade >= 10 ? '#faad14' : '#f5222d'
                                            }}>
                                                {item.grade}/20
                                            </div>
                                        </List.Item>
                                    )}
                                    locale={{ emptyText: 'Aucune autre note dans ce cours' }}
                                />
                            </div>
                        </Card>

                        <Card>
                            <Title level={5}>
                                <Space>
                                    <HistoryOutlined />
                                    Historique
                                </Space>
                            </Title>
                            <Timeline>
                                {grade.history.map((event, index) => (
                                    <Timeline.Item
                                        key={index}
                                        color={
                                            event.action === 'Création' ? 'blue' :
                                                event.action === 'Modification' ? 'orange' :
                                                    event.action === 'Publication' ? 'green' : 'gray'
                                        }
                                    >
                                        <p><strong>{event.action}</strong> - {event.date}</p>
                                        <p>Par: {event.user}</p>
                                        <p>{event.details}</p>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        </Card>
                    </Col>
                </Row>

                {/* Modal for editing grade */}
                <Modal
                    title="Modifier la note"
                    visible={isEditModalVisible}
                    onCancel={handleEditCancel}
                    onOk={handleEditSubmit}
                    okText="Enregistrer"
                    cancelText="Annuler"
                >
                    <Form
                        form={form}
                        layout="vertical"
                    >
                        <Form.Item
                            name="grade"
                            label="Note"
                            rules={[{ required: true, message: 'Veuillez entrer une note' }]}
                        >
                            <InputNumber min={0} max={20} step={0.5} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="comment"
                            label="Commentaire"
                        >
                            <TextArea rows={4} placeholder="Commentaire sur l'évaluation..." />
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="Statut"
                            rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
                        >
                            <Radio.Group>
                                <Space direction="vertical">
                                    <Radio value="draft">
                                        <Space>
                                            <LockOutlined />
                                            Brouillon (non visible par l'étudiant)
                                        </Space>
                                    </Radio>
                                    <Radio value="published">
                                        <Space>
                                            <UnlockOutlined />
                                            Publier (visible par l'étudiant)
                                        </Space>
                                    </Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Layout>
    );
};

export default GradeDetail;
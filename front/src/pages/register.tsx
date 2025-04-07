import {Button, Checkbox, Form, FormProps, Input, message, Select, Typography} from "antd";
import styles from "@/styles/Login.module.css";
import Title from "antd/es/typography/Title";
import {useRouter} from "next/router";
import { useMutation } from '@apollo/client';
import {LOGIN, REGISTER} from '../graphql/users';
import {setCookie} from "cookies-next";
import {useState} from "react";

const Login = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();
    type FieldType = {
        email?: string;
        password?: string;
        confirm_password?: string;
    };

    const [register, { loading }] = useMutation(REGISTER, {
        onCompleted: (data) => {
            console.log(data);
            router.push("/login");
        },
        onError: (error) => {
            messageApi.open({
                type: 'error',
                content: 'Une erreur est survenue',
            });
        }
    });

    const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
        const data = {
            email : values.email,
            password : values.password,
            pseudo : "test",
            role : "ROLE_USER"
        }

        try {
            register({
                variables: data
            }).then((response) => {
                console.log(response);
            });
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: 'Une erreur est survenue lors de l\'inscription',
            });
        }
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className={styles.formWrapper}>
            {contextHolder}
            <div className={styles.formContainer}>
                <Title style={{fontWeight : "700", textAlign : "center", margin : "2rem 0"}} level={2}>Création de compte</Title>
                <Form
                    name="basic"
                    layout="vertical"
                    style={{ maxWidth: 800 }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item<FieldType>
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Merci de saisir votre adresse mail!' }]}
                    >
                        <Input type={"email"} placeholder="exemple@mail.com"/>
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Mot de passe"
                        name="password"
                        rules={[{ required: true, message: 'Merci de saisir votre mot de passe!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Confirmation de mot de passe"
                        name="confirm_password"
                        rules={[
                            {
                                required: true,
                                message: 'Merci de confirmer votre mot de passe!',
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Le mot de passe ne correspond pas!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <div style={{display : "flex", justifyContent: "center", width : "100%"}}>
                        <Button type="primary" htmlType="submit">
                            S&apos;inscrire
                        </Button>
                    </div>
                </Form>
                <div className={styles.noAccount}>
                    <p>Vous avez déjà un compte ?</p>
                    <a onClick={() => router.push("/login")}>Connectez vous</a>
                </div>
            </div>
        </div>
    )
}

export default Login;
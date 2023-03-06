import { Button, Input, message, Typography } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import Aligner from "./components/Aligner";

const LoginForm = () => {
    const localStorageAddress = "user";
    const [data, setData] = useState({
        username: "arman.zhumatayev",
        password: "",
    });

    const login = () => {
        axios
            .post("/auth/authenticate", data)
            .then((response) => {
                setAuthorized(true);
                setUserName(response.data.firstName);
                setData({ ...data, password: "" });
                localStorage.setItem(localStorageAddress, JSON.stringify(response.data));
                window.location.reload();
            })
            .catch((error) => {
                const errorObject = error?.response?.data?.errors;
                if (errorObject) {
                    Object.keys(errorObject).forEach((errorKey) => {
                        message.error(`${errorKey}: ${errorObject[errorKey]}`);
                    });
                }
            });
    };

    const logout = () => {
        setAuthorized(false);
        setUserName("");
        localStorage.removeItem(localStorageAddress);
        window.location.reload();
    };

    const [isAuthorized, setAuthorized] = useState(false);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        setAuthorized(false);
        setUserName("");
        try {
            const storage = localStorage.getItem(localStorageAddress);
            if (!storage) return;
            const parsedStorage = JSON.parse(storage);
            if (parsedStorage) {
                setAuthorized(true);
                setUserName(parsedStorage.firstName);
            }
        } catch (error) {
            localStorage.removeItem(localStorageAddress);
        }
    }, []);

    return (
        <div>
            <Aligner>
                {!isAuthorized ? (
                    <>
                        <Input
                            style={{ width: "200px" }}
                            type="text"
                            value={data.username}
                            onChange={(event) => {
                                setData({ ...data, username: event.target.value });
                            }}
                            placeholder="username"
                        />
                        <Input
                            style={{ width: "200px" }}
                            type="password"
                            value={data.password}
                            onChange={(event) => {
                                setData({ ...data, password: event.target.value });
                            }}
                            placeholder="password"
                        />
                        <Button onClick={login}>Войти</Button>
                    </>
                ) : (
                    <>
                        <Typography.Text italic>
                            Logged as <strong>{userName}</strong>
                        </Typography.Text>
                        <Button onClick={logout}>Выйти</Button>
                    </>
                )}
            </Aligner>
        </div>
    );
};

export default LoginForm;

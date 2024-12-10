import { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import UserContext from "../UserContext";
import { Navigate } from "react-router-dom";

export default function ProfileSettings() {
    const { user, setUser } = useContext(UserContext);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [userDetails, setUserDetails] = useState({});

    useEffect(() => {
        if (user.id) {
            fetchUserDetails();
        }
    }, [user.id]);

    const fetchUserDetails = () => {
        fetch("http://localhost:4000/users/details", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(result => result.json())
        .then(data => {
            setUserDetails(data.result);
        })
        .catch(error => console.error("Error fetching user details:", error));
    };

    const updatePassword = (e) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            return Swal.fire({
                title: "Passwords do not match",
                text: "Please make sure the new password and confirm password are the same.",
                icon: "error"
            });
        }

        fetch(`http://localhost:4000/users/update/${user.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ newPassword })
        })
        .then(result => result.json())
        .then(data => {
            if (data.code === "USER-PASSWORD-SUCCESSFULLY-UPDATED") {
                Swal.fire({
                    title: "Password Updated",
                    text: "Your password has been successfully updated.",
                    icon: "success"
                });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            } else {
                Swal.fire({
                    title: "Error",
                    text: data.message || "An error occurred while updating the password.",
                    icon: "error"
                });
            }
        })
        .catch(error => {
            console.error("Error updating password:", error);
            Swal.fire({
                title: "Internal Server Error",
                text: "Please try again later.",
                icon: "error"
            });
        });
    };

    if (!user.id) {
        return <Navigate to="/login" />;
    }

    return (
        <Container fluid className="vh-100">
            <Row>
                <Col className="vh-100 bg-warning d-flex flex-column align-items-center justify-content-center">
                    <h1 className="display-5 fw-bold">Profile Settings</h1>
                    <p className="lead">Update your profile information and password</p>
                </Col>

                <Col className="vh-100 d-flex justify-content-center align-items-center">
                    <Container className="p-5 w-75">
                        <h3 className="text-center mb-4">User Information</h3>
                        <div className="mb-4">
                            <p><strong>Name:</strong> {userDetails.firstName} {userDetails.lastName}</p>
                            <p><strong>Email:</strong> {userDetails.email}</p>
                        </div>

                        <h3 className="text-center mb-4">Update Password</h3>
                        <Form onSubmit={updatePassword}>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="password"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 rounded-pill">
                                Update Password
                            </Button>
                        </Form>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
}

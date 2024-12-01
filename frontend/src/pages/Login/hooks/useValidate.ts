import useAuth from "@hooks/useAuth.ts";
import { useState } from "react";
import { api } from "@/api/config/axios.ts";
import { useNavigate } from "react-router-dom";
import useToast from "@hooks/useToast.ts";

interface UseValidateProps {
  setIsSignUp: (isSignUp: boolean) => void;
}

const useValidate = ({ setIsSignUp }: UseValidateProps) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await api.post("/api/auth/login", {
        userId: username,
        password: password,
      });

      if (response.data.success) {
        toast.success("로그인에 성공했습니다.");
        auth.logIn();
        auth.setNickname(nickname);
        navigate("/");
        setLoading(false);
      } else {
        toast.error("로그인에 실패했습니다. 다시 시도해주세요");
        setLoading(false);
      }
    } catch (err) {
      console.error("로그인 도중 에러", err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors: string[] = [];

    // 아이디 검증
    if (!username) {
      errors.push("아이디는 필수입니다.");
    } else {
      if (username.length < 4) {
        errors.push("아이디는 최소 4글자 이상이어야 합니다.");
      }
      if (username.length > 20) {
        errors.push("아이디는 20글자 이하여야 합니다.");
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push(
          "아이디는 영문자, 숫자, 언더스코어(_)만 사용할 수 있습니다."
        );
      }
    }

    // 비밀번호 검증
    if (!password) {
      errors.push("비밀번호는 필수입니다.");
    } else {
      if (password.length < 7) {
        errors.push("비밀번호는 최소 7글자 이상이어야 합니다.");
      }
      if (password.length > 20) {
        errors.push("비밀번호는 20글자 이하여야 합니다.");
      }
      if (!/[a-z]/.test(password)) {
        errors.push("비밀번호는 최소 1개의 소문자를 포함해야 합니다.");
      }
      if (!/[0-9]/.test(password)) {
        errors.push("비밀번호는 최소 1개의 숫자를 포함해야 합니다.");
      }
      if (password.includes(username)) {
        errors.push("비밀번호에 아이디을 포함할 수 없습니다.");
      }
    }

    // 비밀번호 확인 검증
    if (!passwordCheck) {
      errors.push("비밀번호 확인은 필수입니다.");
    } else {
      if (password !== passwordCheck) {
        errors.push("비밀번호가 일치하지 않습니다.");
      }
    }

    // 닉네임 검증
    if (!nickname) {
      errors.push("닉네임은 필수입니다.");
    } else {
      if (nickname.length < 2) {
        errors.push("닉네임은 최소 2글자 이상이어야 합니다.");
      }
      if (nickname.length > 10) {
        errors.push("닉네임은 10글자 이하여야 합니다.");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const { isValid, errors } = validate();

      if (errors.length > 0) {
        errors.forEach((error) => {
          toast.error(error);
        });
        return;
      }

      if (isValid) {
        const response = await api.post("/api/user/signup", {
          id: username,
          password: password,
          nickname: nickname,
        });

        if (response.data.status) {
          toast.success("회원가입에 성공했습니다. 로그인해주세요.");
          setIsSignUp(false);
        } else {
          toast.error("회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
      }
    } catch (err) {
      console.error("회원가입 도중 에러", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    setUsername,
    setPassword,
    setPasswordCheck,
    setNickname,
    loading,
    handleLogin,
    handleSignUp,
  };
};

export default useValidate;

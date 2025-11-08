import React from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export const useGlobalToast = () => {
    const { toast } = useToast();

    const getToastConfig = (type, title, message) => {
        const configMap = {
            success: {
                color: "green",
                Icon: CheckCircle,
                bg: "bg-green-50 dark:bg-green-950/30",
                border: "border-l-4 border-green-500 dark:border-green-600",
            },
            error: {
                color: "red",
                Icon: XCircle,
                bg: "bg-red-50 dark:bg-red-950/30",
                border: "border-l-4 border-red-500 dark:border-red-600",
            },
            warning: {
                color: "orange",
                Icon: AlertTriangle,
                bg: "bg-orange-50 dark:bg-orange-950/30",
                border: "border-l-4 border-orange-500 dark:border-orange-600",
            },
            info: {
                color: "blue",
                Icon: Info,
                bg: "bg-blue-50 dark:bg-blue-950/30",
                border: "border-l-4 border-blue-500 dark:border-blue-600",
            },
        };

        const { color, Icon, bg, border } = configMap[type] || configMap.info;

        return {
            title: (
                <div className={`flex items-center gap-2 text-${color}-600 font-semibold`}>
                    <Icon className="h-5 w-5" />
                    <span>{title}</span>
                </div>
            ),
            description: (
                <div className="text-sm text-muted-foreground mt-1">{message}</div>
            ),
            className: `${bg} ${border}`,
        };
    };

    const success = (message, title = "Thành công") =>
        toast(getToastConfig("success", title, message));

    const error = (message, title = "Lỗi") =>
        toast(getToastConfig("error", title, message));

    const warning = (message, title = "Cảnh báo") =>
        toast(getToastConfig("warning", title, message));

    const info = (message, title = "Thông báo") =>
        toast(getToastConfig("info", title, message));

    return { success, error, warning, info };
};

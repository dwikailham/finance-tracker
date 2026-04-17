import { Component, type ErrorInfo, type ReactNode } from "react";
import { Card, Result, Button } from "antd";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
  isWidget?: boolean;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.isWidgetEnabled()) {
        return (
          <Card style={{ borderRadius: 16, border: "1px dashed #ffa39e", background: "#fff2f0" }}>
            <Result
              status="error"
              title={this.props.fallbackTitle || "Komponen Bermasalah"}
              subTitle="Gagal memuat bagian ini."
              extra={[
                <Button 
                  type="primary" 
                  key="retry" 
                  onClick={() => this.setState({ hasError: false })}
                  size="small"
                >
                  Coba Lagi
                </Button>
              ]}
              style={{ padding: "16px 0" }}
            />
          </Card>
        );
      }
      return (
        <Result
          status="500"
          title="Ada yang salah!"
          subTitle="Halaman ini tidak bisa dimuat dengan benar."
          extra={<Button type="primary" onClick={() => window.location.reload()}>Muat Ulang Halaman</Button>}
        />
      );
    }

    return this.props.children;
  }

  private isWidgetEnabled() {
     return this.props.isWidget ?? true;
  }
}

export default ErrorBoundary;

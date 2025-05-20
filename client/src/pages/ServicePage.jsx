import React from "react";
import { Link } from "react-router-dom";
import { Truck, Clock, Globe, Shield, Headphones, Package, MapPin, BarChart3, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';

const ServicesPage = () => {
    const services = [
        {
            id: "fast",
            icon: <Truck className="h-10 w-10 text-teal-600" />,
            name: "Giao hàng nhanh",
            description:
                "Dịch vụ giao hàng siêu tốc trong vòng 2 giờ, đảm bảo hàng hóa của bạn được giao đến tay khách hàng trong thời gian ngắn nhất.",
            features: ["Giao hàng trong 2 giờ", "Theo dõi thời gian thực", "Ưu tiên xử lý", "Bảo hiểm hàng hóa"],
        },
        {
            id: "standard",
            icon: <Package className="h-10 w-10 text-amber-600" />,
            name: "Giao hàng tiêu chuẩn",
            description:
                "Dịch vụ giao hàng tiêu chuẩn trong vòng 24 giờ với chi phí hợp lý, phù hợp với hầu hết các nhu cầu giao hàng thông thường.",
            features: ["Giao hàng trong 24 giờ", "Theo dõi trực tuyến", "Giá cả hợp lý", "Bảo hiểm cơ bản"],
        },
        {
            id: "international",
            icon: <Globe className="h-10 w-10 text-indigo-600" />,
            name: "Giao hàng quốc tế",
            description:
                "Dịch vụ giao hàng xuyên biên giới đến hơn 200 quốc gia và vùng lãnh thổ với thủ tục hải quan đơn giản và thời gian giao hàng nhanh chóng.",
            features: ["Phủ sóng toàn cầu", "Hỗ trợ thủ tục hải quan", "Theo dõi quốc tế", "Bảo hiểm toàn diện"],
        },
        {
            id: "scheduled",
            icon: <Clock className="h-10 w-10 text-rose-600" />,
            name: "Giao hàng hẹn giờ",
            description:
                "Dịch vụ giao hàng theo lịch hẹn cụ thể, cho phép bạn chọn thời gian giao hàng phù hợp với lịch trình của khách hàng.",
            features: ["Chọn khung giờ giao hàng", "Nhắc nhở tự động", "Xác nhận trước khi giao", "Linh hoạt thay đổi"],
        },
        {
            id: "secure",
            icon: <Shield className="h-10 w-10 text-emerald-600" />,
            name: "Giao hàng bảo mật",
            description:
                "Dịch vụ giao hàng với các biện pháp bảo mật cao cấp, đảm bảo an toàn cho các sản phẩm có giá trị cao hoặc tài liệu quan trọng.",
            features: ["Niêm phong bảo mật", "Xác thực người nhận", "Theo dõi GPS liên tục", "Bảo hiểm giá trị cao"],
        },
        {
            id: "support",
            icon: <Headphones className="h-10 w-10 text-blue-600" />,
            name: "Hỗ trợ khách hàng 24/7",
            description:
                "Đội ngũ hỗ trợ khách hàng chuyên nghiệp sẵn sàng giải đáp mọi thắc mắc và hỗ trợ bạn 24/7, kể cả ngày lễ và cuối tuần.",
            features: ["Hỗ trợ đa kênh", "Phản hồi nhanh chóng", "Giải quyết vấn đề tận tâm", "Tư vấn chuyên nghiệp"],
        },
    ];

    const solutions = [
        {
            icon: <MapPin className="h-8 w-8 text-teal-600" />,
            title: "Quản lý tuyến đường thông minh",
            description:
                "Tối ưu hóa tuyến đường giao hàng với thuật toán AI tiên tiến, giúp giảm thời gian và chi phí vận chuyển.",
        },
        {
            icon: <BarChart3 className="h-8 w-8 text-amber-600" />,
            title: "Phân tích dữ liệu giao hàng",
            description:
                "Cung cấp báo cáo chi tiết và phân tích dữ liệu giao hàng, giúp doanh nghiệp đưa ra quyết định kinh doanh tốt hơn.",
        },
        {
            icon: <Smartphone className="h-8 w-8 text-indigo-600" />,
            title: "Ứng dụng di động tiện lợi",
            description:
                "Ứng dụng di động thân thiện với người dùng, cho phép theo dõi đơn hàng và quản lý giao hàng mọi lúc, mọi nơi.",
        },
    ];

    // Cập nhật document title
    React.useEffect(() => {
        document.title = "Dịch vụ | GiaoHangChat";
    }, []);

    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-sky-50 to-white py-16 md:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Dịch vụ giao hàng chặng cuối{" "}
                            <span className="bg-gradient-to-r from-teal-500 to-sky-500 bg-clip-text text-transparent">
                                đáng tin cậy
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8">
                            Chúng tôi cung cấp các giải pháp giao hàng chặng cuối hiệu quả, nhanh chóng và an toàn cho mọi nhu cầu
                            kinh doanh của bạn.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600"
                            >
                                Liên hệ tư vấn
                            </Button>
                            <Button size="lg" variant="outline">
                                Xem bảng giá
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Dịch vụ của chúng tôi</h2>
                        <p className="text-lg text-slate-600">
                            GiaoHangChat cung cấp đa dạng các dịch vụ giao hàng chặng cuối, đáp ứng mọi nhu cầu của khách hàng từ giao
                            hàng nhanh đến giao hàng quốc tế.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <Card key={service.id} className="border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <div className="mb-4">{service.icon}</div>
                                    <CardTitle className="text-xl">{service.name}</CardTitle>
                                    <CardDescription className="text-slate-600">{service.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {service.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
                                                <span className="text-slate-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full">
                                        Tìm hiểu thêm
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-slate-50 py-16 md:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Quy trình giao hàng</h2>
                        <p className="text-lg text-slate-600">
                            Quy trình giao hàng đơn giản, minh bạch và hiệu quả của chúng tôi đảm bảo hàng hóa của bạn được giao đến
                            tay khách hàng một cách nhanh chóng và an toàn.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Process Steps */}
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-teal-200 transform -translate-y-1/2 z-0"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                            {[
                                {
                                    step: "1",
                                    title: "Đặt hàng",
                                    description: "Đặt hàng trực tuyến hoặc qua ứng dụng di động của chúng tôi",
                                },
                                {
                                    step: "2",
                                    title: "Xử lý",
                                    description: "Đơn hàng được xử lý và chuẩn bị giao hàng",
                                },
                                {
                                    step: "3",
                                    title: "Vận chuyển",
                                    description: "Hàng hóa được vận chuyển đến địa điểm giao hàng",
                                },
                                {
                                    step: "4",
                                    title: "Giao hàng",
                                    description: "Hàng hóa được giao đến tay khách hàng",
                                },
                            ].map((step, index) => (
                                <div key={index} className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                                    <p className="text-slate-600">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Solutions Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Giải pháp công nghệ</h2>
                        <p className="text-lg text-slate-600">
                            GiaoHangChat tích hợp công nghệ tiên tiến vào quy trình giao hàng, mang đến trải nghiệm giao hàng hiện đại
                            và hiệu quả.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {solutions.map((solution, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-xl shadow-md border border-slate-100 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="mb-4">{solution.icon}</div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">{solution.title}</h3>
                                <p className="text-slate-600">{solution.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="bg-slate-50 py-16 md:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Bảng giá dịch vụ</h2>
                        <p className="text-lg text-slate-600">
                            Chúng tôi cung cấp các gói dịch vụ với mức giá cạnh tranh, phù hợp với mọi quy mô kinh doanh và nhu cầu
                            giao hàng.
                        </p>
                    </div>

                    <Tabs defaultValue="standard" className="max-w-4xl mx-auto">
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                            <TabsTrigger value="standard">Tiêu chuẩn</TabsTrigger>
                            <TabsTrigger value="express">Nhanh</TabsTrigger>
                            <TabsTrigger value="international">Quốc tế</TabsTrigger>
                        </TabsList>
                        <TabsContent value="standard">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Gói Tiêu Chuẩn</h3>
                                    <p className="text-slate-600 mb-6">Giao hàng trong vòng 24 giờ với chi phí hợp lý</p>
                                    <div className="mb-8">
                                        <span className="text-4xl font-bold text-slate-900">15.000₫</span>
                                        <span className="text-slate-600"> / kg</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            "Giao hàng trong vòng 24 giờ",
                                            "Theo dõi đơn hàng trực tuyến",
                                            "Bảo hiểm hàng hóa cơ bản",
                                            "Hỗ trợ khách hàng trong giờ hành chính",
                                        ].map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
                                                <span className="text-slate-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600">
                                        Chọn gói này
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="express">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Gói Nhanh</h3>
                                    <p className="text-slate-600 mb-6">Giao hàng trong vòng 2 giờ với ưu tiên xử lý</p>
                                    <div className="mb-8">
                                        <span className="text-4xl font-bold text-slate-900">30.000₫</span>
                                        <span className="text-slate-600"> / kg</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            "Giao hàng trong vòng 2 giờ",
                                            "Theo dõi đơn hàng thời gian thực",
                                            "Ưu tiên xử lý đơn hàng",
                                            "Bảo hiểm hàng hóa toàn diện",
                                            "Hỗ trợ khách hàng 24/7",
                                        ].map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
                                                <span className="text-slate-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600">
                                        Chọn gói này
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="international">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Gói Quốc Tế</h3>
                                    <p className="text-slate-600 mb-6">Giao hàng xuyên biên giới đến hơn 200 quốc gia</p>
                                    <div className="mb-8">
                                        <span className="text-4xl font-bold text-slate-900">250.000₫</span>
                                        <span className="text-slate-600"> / kg</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            "Giao hàng đến hơn 200 quốc gia",
                                            "Hỗ trợ thủ tục hải quan",
                                            "Theo dõi đơn hàng quốc tế",
                                            "Bảo hiểm hàng hóa toàn diện",
                                            "Hỗ trợ khách hàng đa ngôn ngữ 24/7",
                                        ].map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
                                                <span className="text-slate-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600">
                                        Chọn gói này
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-teal-500 to-sky-500 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-8 md:p-12 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Sẵn sàng bắt đầu với GiaoHangChat?</h2>
                            <p className="text-lg text-white/90 mb-8">
                                Đăng ký ngay hôm nay để trải nghiệm dịch vụ giao hàng chặng cuối tốt nhất cho doanh nghiệp của bạn.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button size="lg" className="bg-white text-teal-600 hover:bg-slate-100">
                                    Đăng ký ngay
                                </Button>
                                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                                    Liên hệ tư vấn
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ServicesPage;

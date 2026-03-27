import { App } from "@/App";
import app from "@/index";
import EnviromentValidator from "@/enviromentsValidate";

jest.mock("@/index", () => ({
    __esModule: true,
    default: {
        log: {
            info: jest.fn(),
            error: jest.fn(),
        },
        listen: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
    }
}));

jest.mock("@/enviromentsValidate", () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => {
            return {
                validateEnviromentsVariables: jest.fn(),
            };
        }),
    };
});

describe("App", () => {
    let originalProcessExit: any;
    let originalProcessOn: any;
    let originalEnvPort: any;

    beforeAll(() => {
        originalProcessExit = process.exit;
        originalProcessOn = process.on;
        originalEnvPort = process.env.PORT;
        
        process.exit = jest.fn() as any;
        process.env.PORT = "3333";
    });

    afterAll(() => {
        process.exit = originalProcessExit;
        process.on = originalProcessOn;
        process.env.PORT = originalEnvPort;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should bootstrap the application correctly", async () => {
        const application = new App();
        
        // Mocking handleGracefulShutdown internally
        process.on = jest.fn() as any;

        await application.bootstrap();

        expect(EnviromentValidator).toHaveBeenCalled();
        expect(app.listen).toHaveBeenCalledWith({ port: 3333 });
        expect(app.log.info).toHaveBeenCalledWith(expect.stringContaining("3333"));
        expect(process.on).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    });

    it("should gracefully shutdown on SIGINT", async () => {
        const application = new App();
        
        let sigintCallback: any;
        process.on = jest.fn().mockImplementation((event, cb) => {
            if (event === "SIGINT") {
                sigintCallback = cb;
            }
        });

        await application.bootstrap();

        expect(sigintCallback).toBeDefined();

        // Trigger shutdown
        await sigintCallback();

        expect(app.log.info).toHaveBeenCalledWith(expect.stringContaining("shutting down"));
        expect(app.close).toHaveBeenCalled();
        expect(process.exit).toHaveBeenCalledWith(0);
    });
});

import { AdminPageHeader, Panel } from "@/components/admin/panel";
import { AdminForm } from "@/components/admin/admin-form";
import { SettingsForm } from "@/components/admin/settings-form";
import { Field, Input } from "@/components/ui/field";
import { saveAccount } from "@/actions/settings";
import { changePasswordAction } from "@/actions/auth";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/server/queries/site";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, session] = await Promise.all([getSiteSettings(), getSession()]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Site settings"
        title="站点设置"
        description="站点标识、默认 SEO、社交链接与页脚文案。保存后前台缓存立即失效。"
      />

      <div className="max-w-[880px] space-y-6">
        <SettingsForm initial={settings} />

        <Panel title="账号与安全" description="后台只有一位管理员，这里的修改会影响下一次登录。">
          <div className="space-y-6">
            <AdminForm action={saveAccount} submitLabel="保存显示名" compact>
              <Field label="登录邮箱" htmlFor="account-email" hint="邮箱由环境变量预置，暂不支持在后台修改">
                <Input id="account-email" value={session?.email ?? ""} readOnly disabled />
              </Field>
              <div className="mt-4 max-w-sm">
                <Field label="后台显示名" htmlFor="account-name" hint="用于后台欢迎语，不对外展示">
                  <Input id="account-name" name="name" defaultValue={session?.name ?? ""} maxLength={40} />
                </Field>
              </div>
            </AdminForm>

            <AdminForm action={changePasswordAction} submitLabel="更新密码" compact>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="当前密码" htmlFor="currentPassword">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                  />
                </Field>
                <Field label="新密码" htmlFor="newPassword" hint="至少 10 位">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="确认新密码" htmlFor="confirmPassword">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                  />
                </Field>
              </div>
            </AdminForm>
          </div>
        </Panel>
      </div>
    </>
  );
}

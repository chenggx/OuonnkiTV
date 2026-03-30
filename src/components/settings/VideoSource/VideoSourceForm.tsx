import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Info, ChevronsUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useForm,
  type Resolver,
  type UseFormRegister,
  type FieldValues,
  type Path,
  type FieldErrors,
  type FieldError as RHFFieldError,
  type UseFormSetValue,
  type PathValue,
  Controller,
} from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { type VideoApi } from '@/types'
import { useApiStore } from '@/store/apiStore'
import { useState, useEffect } from 'react'

interface InputFormItemProps<T extends FieldValues> {
  label: string
  description: string
  placeholder: string
  id: Path<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  asChild?: boolean
  children?: React.ReactNode
  type?: string
}

function InputFormItem<T extends FieldValues>({
  label,
  description,
  placeholder,
  id,
  register,
  errors,
  asChild,
  children,
  type,
}: InputFormItemProps<T>) {
  return (
    <Field>
      <div className="flex flex-col items-start gap-1.5">
        <FieldLabel className="text-sm font-medium text-white/80" htmlFor={id}>
          {label}
        </FieldLabel>
        <FieldDescription className="flex items-center gap-1.5 text-xs text-white/40">
          <Info size={14} className="hidden md:block" />
          {description}
        </FieldDescription>
      </div>
      {asChild ? (
        children
      ) : (
        <Input
          id={id}
          placeholder={placeholder}
          {...register(id)}
          aria-invalid={errors[id] ? true : false}
          type={type || 'text'}
          className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-amber-500/50"
        />
      )}
      <FieldError
        errors={errors[id] ? [{ message: (errors[id] as RHFFieldError)?.message }] : []}
        className="text-xs text-red-400 mt-1"
      />
    </Field>
  )
}

function VideoSourceFormItem<T extends FieldValues>({
  register,
  errors,
  setValue,
}: {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  setValue: UseFormSetValue<T>
}) {
  const [isRandomId, setIsRandomId] = useState(false)
  const handleRandomIdChange = (checked: boolean) => {
    setIsRandomId(checked)
    if (checked) {
      setValue('id' as Path<T>, uuidv4() as PathValue<T, Path<T>>)
    }
  }
  return (
    <InputFormItem
      label="视频源 ID"
      description="视频源的唯一标识"
      placeholder="例如：source1"
      id={'id' as Path<T>}
      register={register}
      errors={errors}
      asChild
    >
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="例如：source1"
          {...register('id' as Path<T>)}
          aria-invalid={errors['id'] ? true : false}
          disabled={isRandomId}
          className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-amber-500/50"
        />
        <div className="flex w-40 items-center justify-end gap-2">
          <Checkbox
            checked={isRandomId}
            onCheckedChange={handleRandomIdChange}
            className="border-white/20 bg-white/5"
          />
          <Label className="text-sm text-white/60">随机ID</Label>
        </div>
      </div>
    </InputFormItem>
  )
}

export default function VideoSourceForm({ sourceInfo }: { sourceInfo: VideoApi }) {
  const { removeVideoAPI, addAndUpdateVideoAPI, videoAPIs } = useApiStore()
  const formSchema = z.object({
    id: z.string().min(1, '视频源ID不能为空').default(uuidv4()),
    name: z.string().min(1, '视频源名称不能为空').default('视频源1'),
    url: z.string().regex(/^(http|https):\/\//, '请输入有效的URL'),
    detailUrl: z
      .string()
      .regex(/^(http|https):\/\//, '请输入有效的URL')
      .or(z.literal(''))
      .optional(),
    timeout: z.coerce.number().min(300, '超时时间不能为空且需要大于等于300ms').optional(),
    retry: z.coerce.number().min(0, '重试次数不能为空且需要大于等于0').optional(),
    updatedAt: z.coerce.date().default(() => new Date()),
    isEnabled: z.boolean().default(true),
  })
  type FormSchema = z.infer<typeof formSchema>
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema) as Resolver<FormSchema>,
    defaultValues: {
      id: sourceInfo.id,
      name: sourceInfo.name,
      url: sourceInfo.url,
      detailUrl: sourceInfo.detailUrl,
      timeout: sourceInfo.timeout,
      retry: sourceInfo.retry,
      updatedAt: sourceInfo.updatedAt,
      isEnabled: sourceInfo.isEnabled,
    },
  })

  useEffect(() => {
    reset(sourceInfo)
  }, [sourceInfo, reset])

  const onSubmit = (data: FormSchema) => {
    if (data.id !== sourceInfo.id) {
      if (videoAPIs.some(api => api.id === data.id)) {
        toast.error('保存失败，视频源ID已存在')
        return
      }
      removeVideoAPI(sourceInfo.id)
    }

    addAndUpdateVideoAPI(data)
    toast.success('保存成功')
  }

  const onInvalid = (errors: FieldErrors<FormSchema>) => {
    console.error('Form validation errors:', errors)
    toast.error('保存失败，请检查表单填写是否正确')
  }

  const [isOpen, setIsOpen] = useState(false)
  const handleDelete = (id: string) => {
    removeVideoAPI(id)
    toast.success('删除成功')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="flex flex-col gap-5 pt-2">
        <FieldSet className="space-y-4">
          <div>
            <FieldLegend className="text-base font-semibold text-white">基本信息</FieldLegend>
            <FieldDescription className="text-xs text-white/40 mt-1">
              视频源的基本信息
            </FieldDescription>
          </div>
          <FieldGroup className="space-y-4">
            <VideoSourceFormItem register={register} errors={errors} setValue={setValue} />
            <InputFormItem
              label="视频源名称"
              description="视频源用于显示的名称"
              placeholder="例如：视频源1"
              id="name"
              register={register}
              errors={errors}
            />
            <InputFormItem
              label="视频源 URL"
              description="用于视频源解析的 URL"
              placeholder="例如：https://example.com"
              id="url"
              register={register}
              errors={errors}
              type="url"
            />
            <InputFormItem
              label="视频源详情 URL"
              description="留空则使用视频源 URL"
              placeholder="例如：https://example.com"
              id="detailUrl"
              register={register}
              errors={errors}
              type="url"
            />
            <Field orientation="horizontal" className="flex items-center justify-between">
              <div className="flex flex-col items-start gap-1">
                <FieldLabel className="text-sm font-medium text-white/80" htmlFor="isEnabled">
                  是否启用
                </FieldLabel>
                <FieldDescription className="text-xs text-white/40">
                  关闭后将不会搜索该视频源
                </FieldDescription>
              </div>
              <Controller
                control={control}
                name="isEnabled"
                render={({ field }) => (
                  <Switch id="isEnabled" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator className="bg-white/10" />

        <FieldSet className="space-y-4">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center justify-between">
              <div>
                <FieldLegend className="text-base font-semibold text-white">高级设置</FieldLegend>
                <FieldDescription className="text-xs text-white/40 mt-1">
                  超时时间、重试次数等
                </FieldDescription>
              </div>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex flex-col gap-4 pt-4">
              <FieldGroup className="space-y-4">
                <InputFormItem
                  label="超时时间"
                  description="单位为毫秒"
                  placeholder="例如：3000"
                  id="timeout"
                  register={register}
                  errors={errors}
                  type="number"
                />
                <InputFormItem
                  label="重试次数"
                  description="解析失败时的重试次数"
                  placeholder="例如：3"
                  id="retry"
                  register={register}
                  errors={errors}
                  type="number"
                />
              </FieldGroup>
            </CollapsibleContent>
          </Collapsible>
        </FieldSet>

        <div className="flex items-end justify-between pt-4 border-t border-white/10">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <span className="cursor-pointer text-sm text-red-400/70 hover:text-red-400 hover:underline">
                删除本视频源
              </span>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900/95 border border-white/10 backdrop-blur-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">确定要删除本视频源吗？</AlertDialogTitle>
                <AlertDialogDescription className="text-white/60">
                  此操作无法撤销，确认后将<span className="text-red-400">永久删除</span>
                  本视频源。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white">
                  取消
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(sourceInfo.id)}
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  确定删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            type="submit"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold hover:from-amber-400 hover:to-orange-400"
          >
            保存
          </Button>
        </div>
      </div>
    </form>
  )
}

import { OpenAPIV3 } from "openapi-types";

import Comment from "@/generators/Comment";
import Adaptor from "@/providers/Adaptor";
import type { ApiObject } from "@/types/api";
import { isV3ArrySchemaObject, isV3ReferenceObject } from "@/types/openapi";
import type { MaybeTagItem } from "@/types/tag";
import { NormalTypeItem, NormalTypeItems } from "@/types/type";
import refShorten from "@/utils/refShorten";

export default class OpenApiV3 implements Adaptor {
  #apis: ApiObject[] = [];

  static refShorten = (ref: string) => refShorten(ref);

  public get banner() {
    const { info } = this.doc;
    const { version, title, description } = info;

    return Comment.of([
      {
        comment: version,
      },
      { comment: title },
      { comment: description ?? "" },
    ]).to();
  }

  public get schemas() {
    const { components } = this.doc;
    if (components) {
      const { schemas = {}, requestBodies = {}, responses = {} } = components;

      const schemas_ = schemas as Record<string, OpenAPIV3.SchemaObject>;

      return {
        ...schemas,
        ...this.analysisMediaSchemas(schemas_, requestBodies),
        ...this.analysisMediaSchemas(schemas_, responses),
      } as Record<string, OpenAPIV3.SchemaObject>;
    }

    return {};
  }

  public get parameters() {
    const { components } = this.doc;
    if (components) {
      const { parameters = {}, headers = {} } = components;

      return {
        ...(headers as Record<string, OpenAPIV3.ParameterObject>),
        ...(parameters as Record<string, OpenAPIV3.ParameterObject>),
      };
    }

    return {};
  }

  protected analysisMediaSchemas(
    schemas: Record<string, OpenAPIV3.SchemaObject>,
    mediaSchemas: Record<string, OpenAPIV3.RequestBodyObject | OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject>,
  ) {
    const resolveReference = (ref: string) => schemas[OpenApiV3.refShorten(ref)];

    const otherSchemasWithNoReference = {};

    return Object.entries(mediaSchemas).reduce<Record<string, OpenAPIV3.SchemaObject>>((acc, [key, schema]) => {
      if (isV3ReferenceObject(schema)) {
        return Object.assign(acc, {
          [key]: resolveReference(schema.$ref),
        });
      }

      const { content } = schema;

      if (!content) {
        return acc;
      }

      const mediaTypeSchema = (content["application/json"] ?? content["*/*"]).schema;

      if (!mediaTypeSchema) {
        return acc;
      }

      if ((mediaTypeSchema as OpenAPIV3.ReferenceObject).$ref) {
        return Object.assign(acc, {
          [key]: resolveReference((mediaTypeSchema as OpenAPIV3.ReferenceObject).$ref),
        });
      }

      return Object.assign(acc, {
        [key]: mediaTypeSchema as OpenAPIV3.SchemaObject,
      });
    }, otherSchemasWithNoReference);
  }

  protected expandSchemaObject(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): NormalTypeItem["type"] {
    const schema_ = isV3ReferenceObject(schema) ? this.schemas[schema.$ref] : schema;

    if (isV3ArrySchemaObject(schema_)) {
      const { type, items } = schema_;
    } else {
      //
    }
  }

  protected expandParameterSchema(
    parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[],
  ): NormalTypeItems {
    const items: NormalTypeItems = [];

    parameters.forEach((parameter) => {
      parameter = isV3ReferenceObject(parameter) ? this.parameters[parameter.$ref] : parameter;
      const { in: in_, name, deprecated, schema, required } = parameter;
      if (schema) {
        items.push({
          name,
          required,
          deprecated,
          in: in_,
          type: this.expandSchemaObject(schema),
        });
      }
    });

    return items;
  }

  protected analysisApis() {
    const { paths } = this.doc;

    if (Object.keys(paths).length === 0) {
      return [];
    }

    Object.entries(paths).reduce<ApiObject[]>((acc, [path, schema]) => {
      const apiObjects: ApiObject[] = [];

      if (schema) {
        Object.keys(OpenAPIV3.HttpMethods).forEach((method) => {
          const apiMethodObject = schema[method as keyof typeof schema] as OpenAPIV3.OperationObject | undefined;

          if (apiMethodObject) {
            const methodSchema = apiMethodObject;
            const { summary, description, parameters, responses, deprecated, requestBody, tags = [] } = methodSchema;

            const comments = [
              summary && {
                comment: summary,
              },
              description && {
                comment: description,
              },
              tags.length > 0 && {
                tag: "tag",
                comment: tags.join(", "),
              },
              deprecated && {
                tag: "deprecated",
                name: "",
                comment: "",
              },
            ].filter(Boolean) as MaybeTagItem[];

            apiObjects.push({
              comments,
              method,
              url: path,
              parameters: [],
              parametersInUrl: [],
              response: "unknown",
            });
          }
        });
      }

      return acc;
    }, []);

    return [];
  }

  protected readonly doc!: OpenAPIV3.Document;

  constructor(doc: OpenAPIV3.Document) {
    this.doc = doc;
  }

  public parse(): string {
    throw new Error("Method not implemented.");
  }
}
